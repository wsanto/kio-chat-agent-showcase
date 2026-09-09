"""Mistral AI LLM client for ANIMA microservice with structured output support."""

from __future__ import annotations
import re
import os
import aiohttp
import asyncio
import random
from typing import Any, Dict, List, Optional
from loguru import logger


class MistralClient:
    """Async HTTP client for Mistral AI chat completion API with JSON mode."""

    DEFAULT_BASE_URL = "https://api.mistral.ai/v1"

    def __init__(
        self,
        api_key: str,
        base_url: Optional[str] = None,
        session: Optional[aiohttp.ClientSession] = None,
    ) -> None:
        if not api_key or api_key in {"", "your_mistral_api_key_here"}:
            raise ValueError(
                "Valid Mistral AI API key required."
            )

        self.api_key = api_key
        self.base_url = (base_url or self.DEFAULT_BASE_URL).rstrip("/")
        self._session = session

    async def _get_session(self) -> aiohttp.ClientSession:
        if self._session and not self._session.closed:
            return self._session

        # Configure connection pooling for better performance
        connector = aiohttp.TCPConnector(
            limit=20,                    # Max 20 concurrent connections
            limit_per_host=10,           # Max 10 per host
            ttl_dns_cache=300,           # Cache DNS for 5 minutes
            keepalive_timeout=30,        # Keep connections alive
            enable_cleanup_closed=True   # Clean up closed connections
        )

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        self._session = aiohttp.ClientSession(
            headers=headers,
            connector=connector,
            timeout=aiohttp.ClientTimeout(total=60, connect=10)  # Increased timeout for large models
        )
        return self._session

    def _endpoint(self, *parts: str) -> str:
        suffix = "/".join(part.strip("/") for part in parts if part)
        return f"{self.base_url}/{suffix}" if suffix else self.base_url

    async def chat_completion(
        self,
        messages: List[Dict[str, str]],
        *,
        model: str = "mistral-large-latest",
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
        top_p: Optional[float] = None,
        response_format: Optional[Dict[str, str]] = None,  # {"type": "json_object"} for JSON mode
    ) -> Dict[str, Any]:
        """Generate a chat completion from Mistral AI with optional JSON mode.

        Args:
            messages: List of message dicts with 'role' and 'content'
            model: Mistral model identifier (default: mistral-large-latest)
            temperature: Sampling temperature
            max_tokens: Maximum tokens to generate
            top_p: Nucleus sampling parameter
            response_format: {"type": "json_object"} to enable JSON mode

        Returns:
            Dict with 'content', 'reasoning' (if available), and 'raw' response data
        """

        session = await self._get_session()
        payload: Dict[str, Any] = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
        }
        if max_tokens is not None:
            payload["max_tokens"] = max_tokens
        if top_p is not None:
            payload["top_p"] = top_p
        if response_format is not None:
            payload["response_format"] = response_format

        url = self._endpoint("chat", "completions")

        # Only log detailed info in debug mode to reduce I/O overhead
        debug_mode = os.getenv('LOG_LEVEL', 'INFO').upper() == 'DEBUG'
        if debug_mode:
            total_chars = sum(len(str(msg.get('content', ''))) for msg in messages)
            json_mode = "JSON" if response_format else "text"
            logger.debug(f"Mistral API Request: model={model}, messages={len(messages)}, "
                        f"temp={temperature}, mode={json_mode}, max_tokens={max_tokens}, size={total_chars} chars")
        else:
            # Minimal logging in production
            json_indicator = " [JSON]" if response_format else ""
            logger.info(f"Mistral API: {model} ({len(messages)} msgs){json_indicator}")

        # Retry logic for transient errors
        max_retries = 3
        retry_delay = 1.0

        for attempt in range(max_retries):
            try:
                async with session.post(url, json=payload) as response:
                    if response.status == 502 and attempt < max_retries - 1:
                        # 502 Bad Gateway - server temporarily unavailable, retry with backoff
                        wait_time = retry_delay * (2 ** attempt) + random.uniform(0, 1)
                        logger.warning(f"⚠️ Mistral API 502 error, retrying in {wait_time:.1f}s (attempt {attempt + 1}/{max_retries})")
                        await asyncio.sleep(wait_time)
                        continue

                    if response.status != 200:
                        try:
                            error_body = await response.text()
                        except:
                            error_body = "Could not read error response"
                        logger.error(f"Mistral API error ({response.status}): {error_body}")
                        raise Exception(f"Mistral API error: {error_body or 'No error details'}")

                    try:
                        data = await response.json()
                    except aiohttp.ClientConnectionError as e:
                        logger.warning(f"⚠️ Connection closed while reading response: {e}")
                        raise  # Re-raise to trigger retry logic

                choice = (data.get("choices") or [{}])[0]
                message = choice.get("message", {})
                content = message.get("content")

                # Extract reasoning if present (check for <think> tags)
                reasoning = None
                if content:
                    think_pattern = r'<think>(.*?)</think>\s*(.*)$'
                    match = re.search(think_pattern, content, re.DOTALL | re.IGNORECASE)

                    if match:
                        reasoning = match.group(1).strip()
                        # Remove thinking tags from content
                        content = match.group(2).strip()
                        logger.debug(f"Extracted reasoning ({len(reasoning)} chars) from response")

                # Extract usage stats
                usage = data.get("usage", {})

                return {
                    "content": content or "",
                    "reasoning": reasoning,
                    "raw": {**data, "usage": usage},
                }
            except Exception as exc:
                if attempt < max_retries - 1:
                    wait_time = retry_delay * (2 ** attempt) + random.uniform(0, 1)
                    logger.warning(f"⚠️ Request failed, retrying in {wait_time:.1f}s: {exc}")
                    await asyncio.sleep(wait_time)
                    continue
                logger.error("Failed to call Mistral chat completion after %s attempts: %s", max_retries, exc)
                raise

        # Should not reach here, but add fallback
        raise Exception("Failed to get response from Mistral API after all retries")

    async def generate(
        self,
        prompt: str,
        *,
        model: str = "mistral-large-latest",
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
    ) -> str:
        """Simple generate method that wraps chat_completion.

        Takes a prompt string and returns the response content.

        Args:
            prompt: The prompt to send to the model
            model: Mistral model identifier
            temperature: Sampling temperature
            max_tokens: Maximum tokens to generate

        Returns:
            The model's response content as a string
        """
        messages = [{"role": "user", "content": prompt}]
        result = await self.chat_completion(
            messages=messages,
            model=model,
            temperature=temperature,
            max_tokens=max_tokens,
        )
        return result.get("content", "")

    async def close(self) -> None:
        if self._session and not self._session.closed:
            await self._session.close()
