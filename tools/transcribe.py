import sys, json
from faster_whisper import WhisperModel

video = sys.argv[1]
model = WhisperModel(sys.argv[2] if len(sys.argv) > 2 else "small", device="cpu", compute_type="int8")
segments, info = model.transcribe(video, language="tr", word_timestamps=True, vad_filter=False)
out = []
for s in segments:
    out.append({"start": round(s.start, 2), "end": round(s.end, 2), "text": s.text.strip(),
                "words": [[w.start, w.end, w.word] for w in (s.words or [])]})
    print(f"[{s.start:7.2f} - {s.end:7.2f}] {s.text.strip()}", flush=True)
json.dump(out, open("out/transkript.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("language:", info.language, "prob:", info.language_probability)
