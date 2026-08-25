import json
import re
import sys

import torch
from transformers import MarianMTModel, MarianTokenizer

sys.stdin.reconfigure(encoding="utf-8")
sys.stdout.reconfigure(encoding="utf-8")

MODEL_NAME = "Helsinki-NLP/opus-mt-en-es"


def translation_chunks(text, limit=650):
    safe_text = re.sub(r"[\ud800-\udfff\ufffd]", '"', str(text))
    normalized = re.sub(r"[ \t]+", " ", safe_text.replace("\r", "")).strip()
    units = re.split(r"(?<=[.!?])\s+|\n{2,}|(?=\n?[•▪])", normalized)
    chunks = []
    for unit in units:
        unit = re.sub(r"\s*\n\s*", " ", unit).strip()
        while len(unit) > limit:
            boundary = unit.rfind(" ", 0, limit)
            if boundary < limit // 2:
                boundary = limit
            chunks.append(unit[:boundary].strip())
            unit = unit[boundary:].strip()
        if unit:
            chunks.append(unit)
    return chunks


def translate_text(tokenizer, model, text):
    chunks = translation_chunks(text)
    translated = []
    for index in range(0, len(chunks), 16):
        batch = chunks[index:index + 16]
        inputs = tokenizer(batch, return_tensors="pt", padding=True, truncation=True, max_length=512)
        with torch.inference_mode():
            generated = model.generate(**inputs, num_beams=1, max_length=512)
        translated.extend(tokenizer.batch_decode(generated, skip_special_tokens=True))
    return "\n".join(translated)


def main():
    tokenizer = MarianTokenizer.from_pretrained(MODEL_NAME)
    model = MarianMTModel.from_pretrained(MODEL_NAME)
    model.eval()

    for raw_line in sys.stdin:
        raw_line = raw_line.strip()
        if not raw_line:
            continue
        request = json.loads(raw_line)
        try:
            translated = translate_text(tokenizer, model, request.get("text", ""))
            response = {"id": request.get("id"), "text": translated}
        except Exception as error:  # pragma: no cover - comunica errores al orquestador
            response = {"id": request.get("id"), "error": str(error)}
        print(json.dumps(response, ensure_ascii=True), flush=True)


if __name__ == "__main__":
    main()
