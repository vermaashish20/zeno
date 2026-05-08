import sys
import os
import asyncio

# Add the backend directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.llm_service import LLMService
from services.rag_service import RAGService
from services.agent_service import AgentService

async def test_agent_flow():
    llm = LLMService()
    rag = RAGService(llm)
    agent = AgentService(llm, rag)
    
    print("Testing Agent Flow - Greeting (Should skip retrieval)")
    state1 = await agent.run("Hello there!", "kb", "dummy_id", "test_thread_1")
    print(f"Next Step: {state1['next_step']}")
    print(f"Context: {state1['context']}")
    
    print("\nTesting Agent Flow - Specific Question (Should use retrieval)")
    # This might return "No relevant context" but next_step should be "retrieve"
    state2 = await agent.run("What is discussed in the transcript?", "kb", "dummy_id", "test_thread_2")
    print(f"Next Step: {state2['next_step']}")
    print(f"Context: {state2['context']}")

if __name__ == "__main__":
    asyncio.run(test_agent_flow())
