"""
WebSocket streaming chat endpoint for real-time AI responses.
"""

import json
import uuid
import asyncio
from typing import Optional, Dict, Any, AsyncGenerator, List
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from loguru import logger

from app.services import MistralClient, SynapseClient, MemoryService
from app.core.config import settings
from app.db.postgres import PostgresDatabase


router = APIRouter()


class StreamingAgentService:
    """Agent service with streaming capabilities and LLM-based reasoning."""

    def __init__(
        self,
        llm_client: MistralClient,
        emotion_client: SynapseClient,
        memory_service: MemoryService
    ):
        self.llm = llm_client
        self.emotion = emotion_client
        self.memory = memory_service

    async def analyze_emotion_with_llm(self, message: str) -> Dict[str, Any]:
        """Use LLM to analyze emotion when SYNAPSE is unavailable."""
        prompt = f"""Analyze the emotional content of this message and respond with ONLY a JSON object (no other text):

Message: "{message}"

Respond with this exact JSON format:
{{"primary_emotion": "joy|sadness|anger|fear|surprise|disgust|neutral", "confidence": 0.0-1.0, "valence": -1.0 to 1.0, "arousal": 0.0-1.0, "reasoning": "brief explanation"}}"""

        try:
            response = await self.llm.chat_completion(
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1,
                max_tokens=200
            )

            content = response.get("content", "").strip()
            # Try to extract JSON from the response
            if "{" in content and "}" in content:
                json_start = content.find("{")
                json_end = content.rfind("}") + 1
                json_str = content[json_start:json_end]
                emotion_data = json.loads(json_str)
                emotion_data["source"] = "llm_analysis"
                return emotion_data
        except Exception as e:
            logger.warning(f"LLM emotion analysis failed: {e}")

        return {
            "primary_emotion": "neutral",
            "confidence": 0.5,
            "valence": 0.0,
            "arousal": 0.5,
            "source": "default"
        }

    async def stream_chat(
        self,
        user_id: str,
        message: str,
        session_id: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """
        Stream a chat response with real-time updates.
        """
        context = context or {}

        try:
            # Step 1: Create or get session
            if not session_id:
                session_id = await self.memory.create_session(
                    user_id=user_id,
                    metadata={"context": context, "streaming": True}
                )
                logger.info(f"Created new streaming session {session_id}")

            yield {"type": "session", "data": {"session_id": session_id}}

            # Step 2: Analyze emotion
            yield {"type": "thinking", "data": {"step": "Analyzing your emotional state..."}}

            # Try SYNAPSE first, then fall back to LLM
            try:
                emotion_data = await self.emotion.analyze_emotions(
                    message=message,
                    user_id=user_id,
                    context_id=session_id
                )
                emotion_data["source"] = "synapse"
            except Exception as e:
                logger.warning(f"SYNAPSE failed, using LLM analysis: {e}")
                emotion_data = await self.analyze_emotion_with_llm(message)

            primary_emotion = emotion_data.get("primary_emotion", "neutral")
            confidence = emotion_data.get("confidence", 0.0)

            yield {
                "type": "emotion",
                "data": {
                    "primary_emotion": primary_emotion,
                    "confidence": confidence,
                    "valence": emotion_data.get("valence"),
                    "arousal": emotion_data.get("arousal"),
                    "source": emotion_data.get("source", "unknown"),
                    "reasoning": emotion_data.get("reasoning")
                }
            }

            # Step 3: Store user message
            yield {"type": "thinking", "data": {"step": "Processing your message..."}}

            user_message_id = await self.memory.store_message(
                session_id=session_id,
                user_id=user_id,
                role="user",
                content=message,
                emotion=primary_emotion,
                metadata={"emotion_confidence": confidence, "context": context}
            )

            # Step 4: Build conversation context
            yield {"type": "thinking", "data": {"step": "Gathering conversation context..."}}

            conversation_history = await self.memory.get_messages(
                session_id=session_id,
                limit=10
            )

            # Step 5: Build LLM messages with reasoning instructions
            system_prompt = self._build_reasoning_system_prompt(primary_emotion, emotion_data, message)
            llm_messages = [{"role": "system", "content": system_prompt}]

            for hist_msg in conversation_history[:-1]:
                llm_messages.append({
                    "role": hist_msg.role,
                    "content": hist_msg.content
                })

            llm_messages.append({"role": "user", "content": message})

            # Step 6: Stream LLM response
            yield {"type": "thinking", "data": {"step": "Generating thoughtful response..."}}

            full_response = ""
            reasoning_text = ""

            async for chunk in self._stream_llm_response(llm_messages):
                # Check if this is reasoning (in <think> tags)
                if chunk.startswith("<think>") or reasoning_text:
                    reasoning_text += chunk
                    if "</think>" in reasoning_text:
                        # Extract reasoning
                        think_end = reasoning_text.find("</think>")
                        actual_reasoning = reasoning_text[7:think_end].strip()
                        remaining = reasoning_text[think_end + 8:].strip()

                        # Yield the reasoning
                        yield {
                            "type": "reasoning_update",
                            "data": {"reasoning": actual_reasoning}
                        }

                        # Continue with actual response
                        if remaining:
                            full_response += remaining
                            yield {"type": "chunk", "data": {"content": remaining}}
                        reasoning_text = ""
                else:
                    full_response += chunk
                    yield {"type": "chunk", "data": {"content": chunk}}

            # Step 7: Generate dynamic chain of thought based on actual reasoning
            chain_of_thought = {
                "steps": [
                    f"Detected emotion: {primary_emotion} with {confidence:.0%} confidence",
                    f"Emotional valence: {'positive' if emotion_data.get('valence', 0) > 0 else 'negative' if emotion_data.get('valence', 0) < 0 else 'neutral'}",
                    f"Analyzed {len(conversation_history)} messages for context",
                    f"Response strategy: Empathetic acknowledgment with {primary_emotion}-aware tone",
                ],
                "emotion_analysis": emotion_data.get("reasoning", f"User appears to be feeling {primary_emotion}"),
                "context_used": [f"{msg.role}: {msg.content[:60]}..." for msg in conversation_history[:3]],
                "response_strategy": f"Responding with {self._get_response_strategy(primary_emotion)} approach"
            }

            yield {
                "type": "reasoning",
                "data": {
                    "chain_of_thought": chain_of_thought,
                    "trajectory_mood": self._determine_trajectory(emotion_data)
                }
            }

            # Step 8: Store agent response
            agent_message_id = await self.memory.store_message(
                session_id=session_id,
                user_id=user_id,
                role="assistant",
                content=full_response,
                metadata={"model": "mistral-large-latest", "streaming": True},
                reasoning={
                    "emotion_analysis": emotion_data,
                    "context_used": {"conversation_length": len(conversation_history)},
                    "response_strategy": chain_of_thought["response_strategy"]
                },
                chain_of_thought=chain_of_thought,
                trajectory_mood=self._determine_trajectory(emotion_data)
            )

            yield {
                "type": "complete",
                "data": {
                    "message_id": agent_message_id,
                    "user_message_id": user_message_id,
                    "session_id": session_id,
                    "full_response": full_response
                }
            }

        except Exception as e:
            logger.error(f"Streaming chat error: {e}")
            yield {"type": "error", "data": {"message": str(e)}}

    def _get_response_strategy(self, emotion: str) -> str:
        """Get human-readable response strategy based on emotion."""
        strategies = {
            "joy": "celebratory and exploratory",
            "sadness": "supportive and validating",
            "anger": "calm and understanding",
            "fear": "reassuring and grounding",
            "surprise": "curious and engaging",
            "disgust": "respectful and boundary-aware",
            "neutral": "warm and conversational"
        }
        return strategies.get(emotion.lower(), "empathetic and attentive")

    async def _stream_llm_response(self, messages: list) -> AsyncGenerator[str, None]:
        """Stream LLM response chunks using Mistral's streaming API."""
        import aiohttp

        session = await self.llm._get_session()
        url = self.llm._endpoint("chat", "completions")

        payload = {
            "model": "mistral-large-latest",
            "messages": messages,
            "temperature": 0.7,
            "max_tokens": 2000,
            "stream": True
        }

        try:
            async with session.post(url, json=payload) as response:
                if response.status != 200:
                    error_body = await response.text()
                    logger.error(f"Mistral streaming error: {error_body}")
                    yield f"I apologize, but I encountered an issue generating a response. Please try again."
                    return

                buffer = ""
                async for line in response.content:
                    line = line.decode("utf-8")
                    buffer += line

                    while "\n" in buffer:
                        line, buffer = buffer.split("\n", 1)
                        line = line.strip()

                        if not line or line.startswith(":"):
                            continue

                        if line.startswith("data: "):
                            data = line[6:]

                            if data == "[DONE]":
                                return

                            try:
                                chunk_data = json.loads(data)
                                choices = chunk_data.get("choices", [])
                                if choices:
                                    delta = choices[0].get("delta", {})
                                    content = delta.get("content", "")
                                    if content:
                                        yield content
                            except json.JSONDecodeError:
                                continue

        except Exception as e:
            logger.error(f"LLM streaming error: {e}")
            yield f"I apologize, but I encountered an issue. Please try again."

    def _build_reasoning_system_prompt(self, primary_emotion: str, emotion_data: Dict[str, Any], user_message: str) -> str:
        """Build system prompt that encourages contextual, emotion-aware responses."""

        emotion_context = {
            "joy": "The user is expressing happiness or positive feelings. Engage enthusiastically, explore what's making them happy, and help them savor the moment.",
            "sadness": "The user seems to be experiencing sadness. Offer gentle support, validate their feelings, and create space for them to express themselves.",
            "anger": "The user appears frustrated or upset. Acknowledge their feelings without judgment, help them process the situation, and offer perspective when appropriate.",
            "fear": "The user seems anxious or worried. Provide reassurance, help them feel heard, and offer grounding techniques if helpful.",
            "surprise": "The user is experiencing something unexpected. Help them process this new information and explore its implications.",
            "disgust": "The user is expressing discomfort or aversion. Respect their boundaries and help them understand their reaction.",
            "neutral": "Engage naturally and attentively, being ready to pick up on subtle emotional cues."
        }

        context_guidance = emotion_context.get(primary_emotion.lower(), emotion_context["neutral"])

        valence = emotion_data.get("valence", 0)
        valence_description = "positive" if valence > 0.2 else "negative" if valence < -0.2 else "neutral"

        return f"""You are ANIMA, an emotionally intelligent AI companion. Your role is to help users explore their thoughts and feelings with genuine empathy and insight.

CURRENT EMOTIONAL CONTEXT:
- Detected emotion: {primary_emotion} ({emotion_data.get('confidence', 0):.0%} confidence)
- Emotional valence: {valence_description}
- {context_guidance}

YOUR APPROACH:
1. Acknowledge the user's emotional state naturally (don't just state it clinically)
2. Respond with warmth and genuine curiosity
3. Ask thoughtful follow-up questions to deepen understanding
4. Validate feelings while gently encouraging growth
5. Keep responses conversational and not too long

IMPORTANT:
- Don't start with "I sense you're feeling..." - be more natural
- Match your tone to their emotional state
- Be genuine, not performative
- Focus on the person, not the analysis

Respond directly to what the user shared, acknowledging their emotional experience naturally."""

    def _determine_trajectory(self, emotion_data: Dict[str, Any]) -> str:
        """Determine emotional trajectory."""
        valence = emotion_data.get("valence", 0.0)

        if valence and valence > 0.3:
            return "improving"
        elif valence and valence < -0.3:
            return "declining"
        else:
            return "stable"


@router.websocket("/stream")
async def websocket_chat_stream(websocket: WebSocket):
    """
    WebSocket endpoint for streaming chat responses.
    """
    await websocket.accept()
    logger.info("WebSocket connection established")

    try:
        # Initialize services
        llm_client = MistralClient(api_key=settings.MISTRAL_API_KEY)
        emotion_client = SynapseClient(api_key=settings.SYNAPSE_API_KEY)

        postgres = PostgresDatabase()
        await postgres.initialize()

        memory_service = MemoryService(postgres)

        streaming_agent = StreamingAgentService(
            llm_client=llm_client,
            emotion_client=emotion_client,
            memory_service=memory_service
        )

        while True:
            try:
                data = await websocket.receive_json()

                user_id = data.get("user_id")
                message = data.get("message")
                session_id = data.get("session_id")
                context = data.get("context", {})

                if not user_id or not message:
                    await websocket.send_json({
                        "type": "error",
                        "data": {"message": "user_id and message are required"}
                    })
                    continue

                logger.info(f"Streaming chat for user {user_id}: {message[:50]}...")

                async for event in streaming_agent.stream_chat(
                    user_id=user_id,
                    message=message,
                    session_id=session_id,
                    context=context
                ):
                    await websocket.send_json(event)

                    if event["type"] == "chunk":
                        await asyncio.sleep(0.02)  # Small delay for smooth streaming

            except WebSocketDisconnect:
                logger.info("WebSocket disconnected by client")
                break
            except json.JSONDecodeError as e:
                await websocket.send_json({
                    "type": "error",
                    "data": {"message": f"Invalid JSON: {str(e)}"}
                })
            except Exception as e:
                logger.error(f"WebSocket error: {e}")
                await websocket.send_json({
                    "type": "error",
                    "data": {"message": str(e)}
                })

    except Exception as e:
        logger.error(f"WebSocket initialization error: {e}")
    finally:
        logger.info("WebSocket connection closed")
