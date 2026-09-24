import json
import os

with open(r"e:\Coding Space\aniimo-homeland-guide\data\aniimo_homeland_data.json", "r", encoding="utf-8") as f:
    data = json.load(f)

md = []
md.append("# 🐾 Aniimo Homeland Abilities Encyclopedia")
md.append("")
md.append("A complete reference database of Aniimo species across **Basic Forms**, **Weather Forms**, and **Prismana Forms**, detailing their specific **Homeland Abilities (Levels 1–5)**, workplace perks, and best roles.")
md.append("")
md.append("---")
md.append("")
md.append("## 📑 Quick Navigation by Species")
md.append("")

# Table of species
table_headers = "| No. | Aniimo | Stage | Type | Basic Abilities | Weather Forms | Prismana Abilities |"
table_divider = "| :--- | :--- | :--- | :--- | :--- | :--- | :--- |"
md.append(table_headers)
md.append(table_divider)

for item in data:
    basic = item["forms"]["basic"]
    b_abils = ", ".join([f"`{k} Lv.{v}`" for k, v in basic["abilities"].items()])
    w_count = len(item["forms"].get("weather", []))
    w_str = f"{w_count} variant(s)" if w_count > 0 else "None"
    prismana = item["forms"]["prismana"]
    p_abils = ", ".join([f"`{k} Lv.{v}`" for k, v in prismana["abilities"].items()])
    
    row = f"| **#{item['id']}** | [{item['name']}](#{item['name'].lower()}) | {item['stage']} | {item['primary_element']} | {b_abils} | {w_str} | {p_abils} |"
    md.append(row)

md.append("")
md.append("---")
md.append("")
md.append("## 📖 Detailed Aniimo Profiles")
md.append("")

for item in data:
    name = item["name"]
    stage = item["stage"]
    evo = item["evolution_line"]
    role = item["best_role"]
    forms = item["forms"]
    
    md.append(f"### <a id=\"{name.lower()}\"></a>#{item['id']} - {name}")
    md.append(f"**Stage:** `{stage}` | **Primary Element:** `{item['primary_element']}` | **Evolution Line:** `{evo}`")
    md.append(f"\n> 💡 **Best Homeland Role:** *{role}*\n")
    
    # Forms Table
    md.append("#### Forms & Homeland Abilities Comparison")
    md.append("")
    md.append("| Form Type | Variant Name | Element | Trigger / Condition | Homeland Abilities | Workplace Perk |")
    md.append("| :--- | :--- | :--- | :--- | :--- | :--- |")
    
    # Basic Form
    b = forms["basic"]
    b_abils = ", ".join([f"`{k} Lv.{v}`" for k, v in b["abilities"].items()])
    md.append(f"| **Basic Form** | {b['name']} | {b['element']} | {b['condition']} | {b_abils} | {b['perk']} |")
    
    # Weather Forms
    for wf in forms.get("weather", []):
        w_abils = ", ".join([f"`{k} Lv.{v}`" for k, v in wf["abilities"].items()])
        md.append(f"| **Weather Form** | {wf['name']} | {wf['element']} | `{wf['condition']}` | {w_abils} | {wf['perk']} |")
        
    # Prismana Form
    p = forms["prismana"]
    p_abils = ", ".join([f"`{k} Lv.{v}`" for k, v in p["abilities"].items()])
    md.append(f"| **Prismana Form** | {p['name']} | {p['element']} | `{p['condition']}` | {p_abils} | **{p['perk']}** |")
    
    md.append("")
    md.append("---")
    md.append("")

target_file = r"e:\Coding Space\aniimo-homeland-guide\ANIIMO_DATABASE.md"
with open(target_file, "w", encoding="utf-8") as f:
    f.write("\n".join(md))
print(f"Generated {target_file}")
