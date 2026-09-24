import json

with open(r"e:\Coding Space\aniimo-homeland-guide\data\aniimo_homeland_data.json", "r", encoding="utf-8") as f:
    data = json.load(f)

js_content = f"window.ANIIMO_DATA = {json.dumps(data, indent=2, ensure_ascii=False)};\n"
with open(r"e:\Coding Space\aniimo-homeland-guide\web\data_inline.js", "w", encoding="utf-8") as f:
    f.write(js_content)
print("Generated web/data_inline.js successfully.")

