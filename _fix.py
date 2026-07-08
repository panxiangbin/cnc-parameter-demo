import re
filepath = "F:\\AI工作台\\cnc-parameter-demo\\app.js"
with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

old_block = '<div class="result-header fade-in">'
idx = content.find(old_block)
if idx == -1:
    print("ERROR: result-header not found")
    exit()

# Find the closing div of the header block
close_idx = content.find("</div>", idx)
close_idx = content.find("</div>", close_idx + 6)  # Two closing divs

line = content[close_idx:close_idx+20]
print(f"Found header block, inserting after: ...{line}...")

insert_point = close_idx + 6  # After </div>

material_line = '\n      <div style="font-size:0.82rem;color:var(--text-muted);margin-bottom:12px;text-align:center;">\n        ${matName} \u00b7 ${toolName}\n      </div>\n'

content = content[:insert_point] + material_line + content[insert_point:]

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Material/tool info added successfully!")
print(f"File size: {len(content)} bytes")
