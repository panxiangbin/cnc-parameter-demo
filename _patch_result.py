import re, sys
filepath = "F:\\AI工作台\\cnc-parameter-demo\\app.js"
with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

old_start = content.find("    const html = `")
old_end = content.find('    document.getElementById("resultArea").innerHTML = html;', old_start)
if old_start == -1 or old_end == -1:
    print("ERROR: Could not find old HTML template block")
    sys.exit(1)

old_end += len('    document.getElementById("resultArea").innerHTML = html;')

new_html = """    const html = `
      <div class="result-header fade-in">
        <h3>\U0001f4ca 推荐结果</h3>
        <span class="risk-badge ${riskInfo.cls}">${riskInfo.text}</span>
      </div>
      <div class="tool-dir-card fade-in">
        <span class="tool-dir-label">推荐刀具方向</span>
        <span class="tool-dir-value">${dirInfo.text}</span>
      </div>
      <div class="result-grid fade-in">
        <div class="result-data-card">
          <div class="data-label">⚡ 推荐线速度 Vc</div>
          <div class="data-value">${fmtRange(vcMin, vcMax, "")}</div>
          <span class="data-unit">m/min</span>
        </div>
        <div class="result-data-card">
          <div class="data-label">\U0001f504 推荐主轴转速 S</div>
          <div class="data-value">${fmtRange(sMin, sMax, "")}</div>
          <span class="data-unit">rpm</span>
        </div>
        <div class="result-data-card">
          <div class="data-label">⚙\uFE0F 推荐每齿进给 Fz</div>
          <div class="data-value">${fmtRange(fzMin, fzMax, "")}</div>
          <span class="data-unit">mm/tooth</span>
        </div>
        <div class="result-data-card">
          <div class="data-label">\U0001f4c8 推荐每分钟进给 F</div>
          <div class="data-value">${fmtRange(fMin, fMax, "")}</div>
          <span class="data-unit">mm/min</span>
        </div>
      </div>
      <div class="risk-card ${risk} fade-in">
        <div class="risk-row">
          <span class="risk-label">⚠ 风险提醒</span>
          <span class="risk-badge ${riskInfo.cls}">${riskInfo.text}</span>
        </div>
        <div class="risk-desc">${riskWarning}</div>
      </div>
      <div class="tips-card fade-in">
        <div class="tips-title">\U0001f4a1 老师傅调整建议</div>
        <ul>
          ${adjTips.map(t => `<li>${t}</li>`).join("")}
        </ul>
      </div>
    `;

    document.getElementById("resultArea").innerHTML = html;"""

content = content[:old_start] + new_html + content[old_end:]

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("JS result rendering updated successfully!")
checks = ["推荐结果", "tool-dir-card", "result-grid", "risk-card", "tips-card", "老师傅"]
for c in checks:
    print(f"  {c}: {c in content}")
