src = open('batch_redcap_extractor.py', encoding='utf-8').read()
note = open('demo_note.txt', encoding='utf-8').read()
start = src.index('synthetic_notes = [')
end = src.index('\nextracted_records = []')
src = src[:start] + 'synthetic_notes = [' + repr(note) + ']\n' + src[end:]
checks = []
def rep(a, b):
    global src
    checks.append((a[:40], a in src))
    src = src.replace(a, b, 1)
rep('model="qwen2.5:32b"', 'model="qwen2.5:7b"')
rep('extracted_records = []', 'extracted_records = []\nCAPTURE = {"note": synthetic_notes[0].strip(), "model": "qwen2.5:7b"}')
rep('        print(distilled_summary.content)\n', '        print(distilled_summary.content)\n        CAPTURE["summary"] = distilled_summary.content\n')
rep('        for step in combined_reasoning:\n            print(step)', '        CAPTURE["reasoning"] = combined_reasoning\n        CAPTURE["record"] = dict(data)\n        for step in combined_reasoning:\n            print(step)')
src += '''
import json as _json
CAPTURE["csv_columns"] = list(df.columns)
CAPTURE["csv_row"] = [None if (isinstance(v, float) and v != v) else (v.item() if hasattr(v, "item") else v) for v in df.iloc[0].tolist()]
_json.dump(CAPTURE, open("demo_snapshot.json", "w", encoding="utf-8"), indent=1, ensure_ascii=False, default=str)
print("saved demo_snapshot.json")
'''
print(checks)
open('demo_capture.py', 'w', encoding='utf-8').write(src)
