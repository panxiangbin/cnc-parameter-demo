filepath = "F:\\AI工作台\\cnc-parameter-demo\\app.js"
with open(filepath, "r", encoding="utf-8") as f:
    lines = f.readlines()
for i, line in enumerate(lines):
    if 'result-card fade-in" style="text-align:center;"' in line:
        lines[i] = line.replace(
            'result-card fade-in" style="text-align:center;"',
            'risk-card high fade-in" style="text-align:center;'
        )
        print(f"Fixed line {i}: {lines[i][:80]}")
        break
with open(filepath, "w", encoding="utf-8") as f:
    f.writelines(lines)
print("Done")
