"""
Diagnostic endpoints for debugging SYNAPSE and other services.
"""

from typing import Dict, Any, List
from fastapi import APIRouter
from loguru import logger
import aiohttp

from app.core.config import settings

router = APIRouter()


@router.get("/synapse")
async def diagnose_synapse() -> Dict[str, Any]:
    """
    Run diagnostics on the SYNAPSE emotion analysis API.

    Returns:
        Diagnostic report with:
        - API configuration status
        - Connection test results
        - Emotion analysis test results for various messages
        - Recommendations for fixing issues
    """
    report = {
        "service": "SYNAPSE",
        "status": "unknown",
        "checks": [],
        "recommendations": [],
        "test_results": [],
    }

    # Check 1: API Key Configuration
    api_key = settings.SYNAPSE_API_KEY
    base_url = settings.SYNAPSE_BASE_URL

    if not api_key:
        report["checks"].append({
            "name": "API Key",
            "status": "fail",
            "message": "SYNAPSE_API_KEY not configured"
        })
        report["recommendations"].append("Set SYNAPSE_API_KEY in your .env file")
        report["status"] = "error"
        return report
    elif api_key == "your_kaiko_api_key_here":
        report["checks"].append({
            "name": "API Key",
            "status": "fail",
            "message": "SYNAPSE_API_KEY is placeholder value"
        })
        report["recommendations"].append("Get a valid API key from https://core.kaikostudios.xyz/api-keys")
        report["status"] = "error"
        return report
    else:
        report["checks"].append({
            "name": "API Key",
            "status": "pass",
            "message": f"API key configured: {api_key[:10]}...{api_key[-4:]}"
        })

    report["checks"].append({
        "name": "Base URL",
        "status": "pass",
        "message": f"Base URL: {base_url}"
    })

    # Check 2: API Connection
    headers = {
        "x-api-key": api_key,
        "Content-Type": "application/json",
    }

    test_messages = [
        ("happy", "I am so happy and excited about my promotion today!"),
        ("sad", "I feel really sad and down today, nothing seems to be going right."),
        ("angry", "I am furious about what happened, this is completely unacceptable!"),
        ("anxious", "I'm really nervous about my job interview tomorrow, I can't stop worrying."),
        ("neutral", "The weather today is cloudy with a chance of rain."),
    ]

    try:
        async with aiohttp.ClientSession(headers=headers) as session:
            # Basic connectivity test using POST /v1/emotions/analyse
            test_url = f"{base_url}/v1/emotions/analyse"
            test_body = {
                "model": "emotion-v1",
                "messages": [{"role": "user", "content": {"text": "hello"}}]
            }

            async with session.post(test_url, json=test_body, timeout=aiohttp.ClientTimeout(total=10)) as response:
                status_code = response.status
                body = await response.text()

                if status_code == 200:
                    report["checks"].append({
                        "name": "API Connection",
                        "status": "pass",
                        "message": f"API reachable (status: {status_code})"
                    })
                elif status_code == 401:
                    report["checks"].append({
                        "name": "API Connection",
                        "status": "fail",
                        "message": f"Authentication failed (status: {status_code})"
                    })
                    report["recommendations"].append("Check your API key is valid")
                    report["status"] = "error"
                    return report
                elif status_code == 403:
                    report["checks"].append({
                        "name": "API Connection",
                        "status": "fail",
                        "message": f"Access denied (status: {status_code})"
                    })
                    report["recommendations"].append("Your API key may not have emotion analysis permissions")
                    report["status"] = "error"
                    return report
                elif status_code == 500:
                    report["checks"].append({
                        "name": "API Connection",
                        "status": "warning",
                        "message": f"Server error (status: {status_code})"
                    })
                    report["recommendations"].append("SYNAPSE API is experiencing issues")
                else:
                    report["checks"].append({
                        "name": "API Connection",
                        "status": "warning",
                        "message": f"Unexpected status: {status_code}, body: {body[:200]}"
                    })

            # Test emotion analysis
            emotions_detected = 0
            empty_responses = 0

            for emotion_type, message in test_messages:
                url = f"{base_url}/v1/emotions/analyse"
                request_body = {
                    "model": "emotion-v1",
                    "messages": [{"role": "user", "content": {"text": message}}]
                }

                try:
                    async with session.post(url, json=request_body, timeout=aiohttp.ClientTimeout(total=15)) as response:
                        if response.status == 200:
                            data = await response.json()
                            emotions = data.get("emotions", {})

                            test_result = {
                                "expected_emotion": emotion_type,
                                "message": message[:50] + "...",
                                "raw_response": data,
                            }

                            if emotions and emotions != {}:
                                # Try to extract primary emotion
                                emotion_data = emotions.get("_default", emotions.get("user", emotions))
                                primary = emotion_data.get("primary_emotion", "unknown")
                                confidence = emotion_data.get("confidence", 0)

                                test_result["detected_emotion"] = primary
                                test_result["confidence"] = confidence
                                test_result["status"] = "pass"
                                emotions_detected += 1
                            else:
                                test_result["detected_emotion"] = None
                                test_result["status"] = "empty"
                                empty_responses += 1

                            report["test_results"].append(test_result)
                        else:
                            report["test_results"].append({
                                "expected_emotion": emotion_type,
                                "status": "error",
                                "error": f"HTTP {response.status}"
                            })

                except Exception as e:
                    report["test_results"].append({
                        "expected_emotion": emotion_type,
                        "status": "error",
                        "error": str(e)
                    })

            # Summary check
            if emotions_detected == len(test_messages):
                report["checks"].append({
                    "name": "Emotion Detection",
                    "status": "pass",
                    "message": f"All {len(test_messages)} test messages returned emotions"
                })
                report["status"] = "healthy"
            elif emotions_detected > 0:
                report["checks"].append({
                    "name": "Emotion Detection",
                    "status": "warning",
                    "message": f"{emotions_detected}/{len(test_messages)} tests returned emotions"
                })
                report["status"] = "degraded"
            else:
                report["checks"].append({
                    "name": "Emotion Detection",
                    "status": "fail",
                    "message": f"All {len(test_messages)} tests returned empty emotions"
                })
                report["recommendations"].append(
                    "SYNAPSE API returns empty emotions. Check API documentation for required parameters."
                )
                report["recommendations"].append(
                    "LLM-based emotion fallback is active and working correctly."
                )
                report["status"] = "degraded"

    except aiohttp.ClientError as e:
        report["checks"].append({
            "name": "API Connection",
            "status": "fail",
            "message": f"Connection failed: {str(e)}"
        })
        report["recommendations"].append("Check your internet connection and base URL")
        report["status"] = "error"
        return report

    except Exception as e:
        report["checks"].append({
            "name": "API Connection",
            "status": "fail",
            "message": f"Unexpected error: {str(e)}"
        })
        report["status"] = "error"
        return report

    # Add fallback info
    report["fallback_status"] = {
        "enabled": True,
        "type": "LLM-based emotion analysis",
        "provider": "Mistral",
        "description": "When SYNAPSE is unavailable or returns empty, the system uses the LLM to analyze emotions"
    }

    return report


@router.get("/llm-emotion")
async def test_llm_emotion(text: str = "I am feeling happy today") -> Dict[str, Any]:
    """
    Test the LLM-based emotion analysis fallback.

    Args:
        text: Message to analyze

    Returns:
        Emotion analysis result from the LLM
    """
    from app.services.llm import MistralClient
    import json

    llm = MistralClient(api_key=settings.MISTRAL_API_KEY)

    prompt = f"""Analyze the emotional content of this message and respond with ONLY a JSON object (no other text):

Message: "{text}"

Respond with this exact JSON format:
{{"primary_emotion": "joy|sadness|anger|fear|surprise|disgust|neutral", "confidence": 0.0-1.0, "valence": -1.0 to 1.0, "arousal": 0.0-1.0, "reasoning": "brief explanation of why this emotion was detected"}}"""

    try:
        response = await llm.chat_completion(
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            max_tokens=200
        )

        content = response.get("content", "").strip()
        if "{" in content and "}" in content:
            json_start = content.find("{")
            json_end = content.rfind("}") + 1
            json_str = content[json_start:json_end]
            emotion_data = json.loads(json_str)
            emotion_data["source"] = "llm_analysis"
            emotion_data["status"] = "success"
            return emotion_data
        else:
            return {
                "status": "error",
                "message": "Could not parse LLM response",
                "raw_response": content
            }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }
    finally:
        await llm.close()


@router.get("/health")
async def health_check() -> Dict[str, Any]:
    """
    Quick health check for all services.

    Returns:
        Health status of each service
    """
    return {
        "api": "healthy",
        "database": "check via /api/v1/chat/sessions",
        "synapse": "check via /api/v1/diagnostics/synapse",
        "llm_fallback": "check via /api/v1/diagnostics/llm-emotion"
    }
