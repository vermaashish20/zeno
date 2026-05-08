import json
from fastapi import HTTPException
from models.schemas import ChatRequest, ChatResponse
from repositories.mongo_repo import MongoRepository
from services.llm_service import LLMService
from services.agent_service import AgentService

class ChatService:
    def __init__(self, repo: MongoRepository, llm_service: LLMService, agent_service: AgentService):
        self.repo = repo
        self.llm_service = llm_service
        self.agent_service = agent_service

    async def handle_chat(self, req: ChatRequest):
        try:
            # Run the agentic workflow
            # Using a dummy thread_id for now, could be passed from client for real memory
            thread_id = req.user_id if hasattr(req, 'user_id') else "default_user"
            
            final_state = await self.agent_service.run(
                query=req.query,
                target_type=req.target_type,
                target_id=req.target_id,
                thread_id=thread_id
            )
            
            prompt = final_state.get("answer_prompt")
            if not prompt:
                print(f"DEBUG: Agent failed to generate prompt. Final state: {final_state}")
                yield "Error: Agent failed to generate a response prompt."
                return

            # Stream the response back to the user
            response_gen = await self.llm_service.generate_response(prompt, stream=True)
            async for chunk in response_gen:
                yield chunk
            
        except Exception as e:
            yield f"Agent Error: {str(e)}"
