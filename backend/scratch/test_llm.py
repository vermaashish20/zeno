import sys
import os

# Add the backend directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.llm_service import LLMService

def test_llm_service():
    service = LLMService()
    prompt = "Say 'Hello, I am working correctly!'"
    
    print("Testing sync response...")
    sync_res = service.generate_response(prompt, stream=False)
    print(f"Type: {type(sync_res)}")
    print(f"Content: {sync_res}")
    
    if not isinstance(sync_res, str):
        print("FAILED: sync_res is not a string!")
    else:
        print("PASSED: sync_res is a string.")
    
    print("\nTesting stream response...")
    stream_res = service.generate_response(prompt, stream=True)
    print(f"Type: {type(stream_res)}")
    
    content = ""
    for chunk in stream_res:
        content += chunk
        print(f"Chunk: {chunk}")
    
    print(f"Final Content: {content}")
    
    if hasattr(stream_res, '__iter__') and not isinstance(stream_res, (str, list, dict)):
         print("PASSED: stream_res is a generator/iterator.")
    else:
         print("FAILED: stream_res is not a generator/iterator!")

if __name__ == "__main__":
    test_llm_service()
