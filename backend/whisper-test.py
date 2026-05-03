from faster_whisper import WhisperModel

model_size = "distil-large-v3"

model = WhisperModel(model_size,device="cuda", compute_type='int8')
segments, info = model.transcribe("audio.mp3", beam_size=5, language="en", condition_on_previous_text=False)

for segment in segments:
    print("[%.2fs -> %.2fs] %s" % (segment.start, segment.end, segment.text))