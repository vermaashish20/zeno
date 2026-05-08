## Overall UI
- Make it professional ui theme, that user love to use and invest their time on it.


### Content
- Add details about which video is being processing 
- Show duration,size,date uploaded, etc. for the youtube video source.
- 

### Chat
- Make this ui better
- chats leftbar move it to edge isntead of centered
- LLM call, waiting , takes time not good ui
- Add Langchanin behind the scene to make it look like chatting(as it forgets about previous chat)
- Use of RAG for better context management , embed transcriptions to Vector db
- Add New Chat , Chat History

### Import
- if importing playlist or channel, the selection screen is not shown to me , fix this
- Should be concurrent downloading , thus openwhisper can start working on transcrption without waiting for all videos to download.
- 


## Deployement
- Try to Deploy it on Azure or any Serverless Services


## Speed in Server, Consideration for Scalability
- Three services make them concurrent, event driven :
    - Dowloading service
    - Transcription service
    - Embedding and Vector Db service
    - Chat service
- Use message queue , state machine , DLT for above services
- Use Redis for caching and message queue
- Use Docker swarm to scale the services 
