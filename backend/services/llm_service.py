import httpx
import json
from config import (
    LLM_PROVIDER, OLLAMA_BASE_URL, OLLAMA_MODEL,
    OPENAI_API_KEY, OPENAI_MODEL,
    GEMINI_API_KEY, GEMINI_MODEL
)

class LLMService:
    def __init__(self):
        self.timeout = 180.0

    async def generate_response(self, prompt: str, stream: bool = False):
        if stream:
            return self._stream_response(prompt)
        else:
            return await self._sync_response(prompt)

    async def _sync_response(self, prompt: str):
        if LLM_PROVIDER == "ollama":
            return await self._call_ollama_sync(prompt)
        elif LLM_PROVIDER == "openai":
            return await self._call_openai_sync(prompt)
        elif LLM_PROVIDER == "gemini":
            return await self._call_gemini_sync(prompt)
        else:
            return "LLM Provider not configured correctly."

    async def _stream_response(self, prompt: str):
        if LLM_PROVIDER == "ollama":
            async for chunk in self._call_ollama_stream(prompt):
                yield chunk
        elif LLM_PROVIDER == "openai":
            async for chunk in self._call_openai_stream(prompt):
                yield chunk
        elif LLM_PROVIDER == "gemini":
            async for chunk in self._call_gemini_stream(prompt):
                yield chunk
        else:
            yield "LLM Provider not configured correctly."

    async def _call_ollama_sync(self, prompt: str):
        try:
            payload = {
                "model": OLLAMA_MODEL,
                "messages": [{"role": "user", "content": prompt}],
                "stream": False
            }
            async with httpx.AsyncClient() as client:
                print(f"DEBUG: Sending POST request to Ollama ({OLLAMA_BASE_URL})...")
                res = await client.post(OLLAMA_BASE_URL, json=payload, timeout=self.timeout)
                print(f"DEBUG: Ollama response status: {res.status_code}")
                res.raise_for_status()
                data = res.json()
                content = data.get("message", {}).get("content", "")
                if not content:
                    print(f"DEBUG: Ollama returned empty content. Full response: {data}")
                return content
        except Exception as e:
            print(f"DEBUG: Ollama request failed: {e}")
            return f"Ollama Error: {str(e)}"

    async def _call_ollama_stream(self, prompt: str):
        try:
            payload = {
                "model": OLLAMA_MODEL,
                "messages": [{"role": "user", "content": prompt}],
                "stream": True
            }
            async with httpx.AsyncClient() as client:
                async with client.stream("POST", OLLAMA_BASE_URL, json=payload, timeout=self.timeout) as response:
                    response.raise_for_status()
                    async for line in response.aiter_lines():
                        if line:
                            chunk = json.loads(line)
                            text = chunk.get("message", {}).get("content", "")
                            if text:
                                yield text
                            if chunk.get("done"):
                                break
        except Exception as e:
            yield f"Ollama Error: {str(e)}"

    async def _call_openai_sync(self, prompt: str):
        if not OPENAI_API_KEY:
            return "Error: OpenAI API Key not configured."
        try:
            headers = {
                "Authorization": f"Bearer {OPENAI_API_KEY}",
                "Content-Type": "application/json"
            }
            payload = {
                "model": OPENAI_MODEL,
                "messages": [{"role": "user", "content": prompt}],
                "stream": False
            }
            async with httpx.AsyncClient() as client:
                res = await client.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload, timeout=self.timeout)
                res.raise_for_status()
                return res.json().get("choices", [{}])[0].get("message", {}).get("content", "")
        except Exception as e:
            return f"OpenAI Error: {str(e)}"

    async def _call_openai_stream(self, prompt: str):
        if not OPENAI_API_KEY:
            yield "Error: OpenAI API Key not configured."
            return
        try:
            headers = {
                "Authorization": f"Bearer {OPENAI_API_KEY}",
                "Content-Type": "application/json"
            }
            payload = {
                "model": OPENAI_MODEL,
                "messages": [{"role": "user", "content": prompt}],
                "stream": True
            }
            async with httpx.AsyncClient() as client:
                async with client.stream("POST", "https://api.openai.com/v1/chat/completions", headers=headers, json=payload, timeout=self.timeout) as response:
                    response.raise_for_status()
                    async for line in response.aiter_lines():
                        if line:
                            if line.startswith("data: "):
                                data_content = line[6:]
                                if data_content == "[DONE]":
                                    break
                                chunk = json.loads(data_content)
                                text = chunk.get("choices", [{}])[0].get("delta", {}).get("content", "")
                                if text:
                                    yield text
        except Exception as e:
            yield f"OpenAI Error: {str(e)}"

    async def _call_gemini_sync(self, prompt: str):
        if not GEMINI_API_KEY:
            return "Error: Gemini API Key not configured."
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}"
            payload = {
                "contents": [{"parts": [{"text": prompt}]}]
            }
            async with httpx.AsyncClient() as client:
                res = await client.post(url, json=payload, timeout=self.timeout)
                res.raise_for_status()
                return res.json().get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
        except Exception as e:
            return f"Gemini Error: {str(e)}"

    async def _call_gemini_stream(self, prompt: str):
        if not GEMINI_API_KEY:
            yield "Error: Gemini API Key not configured."
            return
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:streamGenerateContent?alt=sse&key={GEMINI_API_KEY}"
            payload = {
                "contents": [{"parts": [{"text": prompt}]}]
            }
            async with httpx.AsyncClient() as client:
                async with client.stream("POST", url, json=payload, timeout=self.timeout) as response:
                    response.raise_for_status()
                    async for line in response.aiter_lines():
                        if line:
                            if line.startswith("data: "):
                                chunk = json.loads(line[6:])
                                text = chunk.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                                if text:
                                    yield text
        except Exception as e:
            yield f"Gemini Error: {str(e)}"
