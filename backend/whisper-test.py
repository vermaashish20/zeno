from faster_whisper import WhisperModel

# model_size = "distil-large-v3"
model_size = "tiny"

model = WhisperModel(model_size, compute_type='int8')
segments, info = model.transcribe("downloads/e8352d56-886a-4b76-a1a1-eb8af92d491a.m4a", beam_size=5, language="en", condition_on_previous_text=False)

for segment in segments:
    print("[%.2fs -> %.2fs] %s" % (segment.start, segment.end, segment.text))