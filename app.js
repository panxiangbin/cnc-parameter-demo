/* ============================================
   CNC刀具参数助手 - 核心逻辑
   ============================================ */

(function () {
  "use strict";

  // ==========================================
  // 1. 材料基础推荐规则
  // ==========================================
  // Vc 基准范围 [min, max] m/min
  // 每种材料按刀具类型提供
  const MATERIAL_RULES = {
    aluminum: {
      name: "铝合金",
      hardnessRange: "HB 50–120",
      carbide:   { vc: [200, 400], fzBase: 0.05 },
      coated:    { vc: [250, 500], fzBase: 0.06 },
      hss:       { vc: [80, 150],  fzBase: 0.04 },
      insert:    { vc: [300, 600], fzBase: 0.08 },
      al_tool:   { vc: [350, 700], fzBase: 0.08 },
      ball:      { vc: [150, 300], fzBase: 0.04 },
      drill_bit: { vc: [60, 120],  fzBase: 0.03 },
      tap_tool:  { vc: [8, 20],    fzBase: 0.02 }
    },
    steel_45: {
      name: "45钢",
      hardnessRange: "HB 160–220",
      carbide:   { vc: [120, 200], fzBase: 0.04 },
      coated:    { vc: [150, 250], fzBase: 0.05 },
      hss:       { vc: [22, 35],   fzBase: 0.025 },
      insert:    { vc: [140, 220], fzBase: 0.06 },
      al_tool:   { vc: [80, 140],  fzBase: 0.03 },
      ball:      { vc: [80, 140],  fzBase: 0.03 },
      drill_bit: { vc: [18, 35],   fzBase: 0.02 },
      tap_tool:  { vc: [5, 10],    fzBase: 0.01 }
    },
    steel_40cr: {
      name: "40Cr",
      hardnessRange: "HB 200–280",
      carbide:   { vc: [100, 180], fzBase: 0.035 },
      coated:    { vc: [120, 220], fzBase: 0.045 },
      hss:       { vc: [18, 30],   fzBase: 0.02 },
      insert:    { vc: [120, 200], fzBase: 0.05 },
      al_tool:   { vc: [70, 120],  fzBase: 0.025 },
      ball:      { vc: [70, 120],  fzBase: 0.025 },
      drill_bit: { vc: [15, 28],   fzBase: 0.015 },
      tap_tool:  { vc: [4, 8],     fzBase: 0.008 }
    },
    steel_42crmo: {
      name: "42CrMo",
      hardnessRange: "HB 280–350",
      carbide:   { vc: [80, 150],  fzBase: 0.03 },
      coated:    { vc: [100, 180], fzBase: 0.04 },
      hss:       { vc: [14, 25],   fzBase: 0.018 },
      insert:    { vc: [100, 170], fzBase: 0.045 },
      al_tool:   { vc: [55, 100],  fzBase: 0.02 },
      ball:      { vc: [55, 100],  fzBase: 0.02 },
      drill_bit: { vc: [12, 22],   fzBase: 0.012 },
      tap_tool:  { vc: [3, 6],     fzBase: 0.006 }
    },
    die_steel: {
      name: "模具钢",
      hardnessRange: "HRC 30–52",
      carbide:   { vc: [50, 120],  fzBase: 0.025 },
      coated:    { vc: [70, 160],  fzBase: 0.035 },
      hss:       { vc: [10, 18],   fzBase: 0.015 },
      insert:    { vc: [60, 140],  fzBase: 0.04 },
      al_tool:   { vc: [35, 70],   fzBase: 0.015 },
      ball:      { vc: [40, 80],   fzBase: 0.02 },
      drill_bit: { vc: [8, 15],    fzBase: 0.01 },
      tap_tool:  { vc: [2, 5],     fzBase: 0.005 }
    },
    stainless: {
      name: "不锈钢",
      hardnessRange: "HB 180–280",
      carbide:   { vc: [60, 120],  fzBase: 0.03 },
      coated:    { vc: [80, 160],  fzBase: 0.04 },
      hss:       { vc: [12, 22],   fzBase: 0.018 },
      insert:    { vc: [80, 150],  fzBase: 0.045 },
      al_tool:   { vc: [40, 80],   fzBase: 0.02 },
      ball:      { vc: [40, 80],   fzBase: 0.02 },
      drill_bit: { vc: [8, 18],    fzBase: 0.012 },
      tap_tool:  { vc: [3, 6],     fzBase: 0.005 }
    },
    cast_iron: {
      name: "铸铁",
      hardnessRange: "HB 150–250",
      carbide:   { vc: [100, 200], fzBase: 0.04 },
      coated:    { vc: [120, 250], fzBase: 0.055 },
      hss:       { vc: [18, 30],   fzBase: 0.025 },
      insert:    { vc: [120, 220], fzBase: 0.06 },
      al_tool:   { vc: [60, 120],  fzBase: 0.03 },
      ball:      { vc: [60, 120],  fzBase: 0.03 },
      drill_bit: { vc: [15, 28],   fzBase: 0.02 },
      tap_tool:  { vc: [4, 8],     fzBase: 0.008 }
    },
    copper: {
      name: "铜",
      hardnessRange: "HB 40–80",
      carbide:   { vc: [200, 400], fzBase: 0.06 },
      coated:    { vc: [250, 500], fzBase: 0.07 },
      hss:       { vc: [60, 120],  fzBase: 0.04 },
      insert:    { vc: [250, 450], fzBase: 0.08 },
      al_tool:   { vc: [300, 550], fzBase: 0.07 },
      ball:      { vc: [150, 300], fzBase: 0.05 },
      drill_bit: { vc: [40, 80],   fzBase: 0.03 },
      tap_tool:  { vc: [6, 12],    fzBase: 0.015 }
    },
    titanium: {
      name: "钛合金",
      hardnessRange: "HRC 30–40",
      carbide:   { vc: [30, 60],   fzBase: 0.02 },
      coated:    { vc: [40, 80],   fzBase: 0.025 },
      hss:       { vc: [8, 15],    fzBase: 0.012 },
      insert:    { vc: [35, 65],   fzBase: 0.03 },
      al_tool:   { vc: [20, 40],   fzBase: 0.015 },
      ball:      { vc: [20, 45],   fzBase: 0.015 },
      drill_bit: { vc: [6, 12],    fzBase: 0.008 },
      tap_tool:  { vc: [2, 4],     fzBase: 0.003 }
    },
    custom: {
      name: "自定义",
      hardnessRange: "—",
      carbide:   { vc: [80, 150],  fzBase: 0.035 },
      coated:    { vc: [100, 200], fzBase: 0.045 },
      hss:       { vc: [15, 25],   fzBase: 0.02 },
      insert:    { vc: [100, 180], fzBase: 0.05 },
      al_tool:   { vc: [60, 120],  fzBase: 0.025 },
      ball:      { vc: [50, 100],  fzBase: 0.02 },
      drill_bit: { vc: [10, 20],   fzBase: 0.015 },
      tap_tool:  { vc: [3, 6],     fzBase: 0.006 }
    }
  };

  // 刀具类型显示名映射
  const TOOL_NAMES = {
    carbide: "钨钢铣刀",
    coated: "涂层刀",
    hss: "高速钢刀具",
    insert: "机夹刀片",
    al_tool: "铝用刀",
    ball: "球刀",
    drill_bit: "钻头",
    tap_tool: "丝锥"
  };

  // 加工方式调整系数 (对 Vc 的倍率)
  const PROCESS_ADJUST = {
    face:   1.0,
    side:   0.85,
    slot:   0.70,
    drill:  0.50,
    tap:    0.30,
    finish: 1.10,
    rough:  0.70
  };

  // 机床刚性调整
  const RIGIDITY_ADJUST = {
    good:   1.0,
    normal: 0.85,
    poor:   0.65
  };

  // 装夹调整
  const CLAMP_ADJUST = {
    stable:   1.0,
    overhang: 0.80,
    slender:  0.65,
    chatter:  0.50
  };

  // ==========================================
  // 2. 工具函数
  // ==========================================
  function toNum(v) {
    const n = parseFloat(v);
    return isNaN(n) ? null : n;
  }

  function fmtNum(n, decimals) {
    if (decimals === undefined) decimals = n >= 100 ? 0 : n >= 10 ? 1 : 2;
    return n.toFixed(decimals);
  }

  function fmtRange(min, max, unit) {
    return `${fmtNum(min)} – ${fmtNum(max)} ${unit}`;
  }

  function clamp(val, min, max) {
    return Math.min(Math.max(val, min), max);
  }

  // ==========================================
  // 3. 获取材料规则 (含自定义回退)
  // ==========================================
  function getMaterialRule(mat, tool) {
    const matData = MATERIAL_RULES[mat];
    if (!matData) return null;
    const toolData = matData[tool];
    if (!toolData) return null;
    return { matData, toolData };
  }

  // ==========================================
  // 4. 硬度调整
  // ==========================================
  function applyHardnessAdjust(mat, hType, hValue, baseVc) {
    if (hType === "unknown") return { vcMin: baseVc[0], vcMax: baseVc[1] };
    if (hValue === null) return { vcMin: baseVc[0], vcMax: baseVc[1] };

    // 获取该材料的典型硬度范围中点
    const rangeMap = {
      aluminum:  85,
      steel_45:  190,
      steel_40cr: 240,
      steel_42crmo: 315,
      die_steel: 40,   // HRC
      stainless: 230,
      cast_iron: 200,
      copper:    60,
      titanium:  35,   // HRC
      custom:    200
    };

    const typical = rangeMap[mat] || 200;
    let ratio;

    if (hType === "hrc") {
      // HRC: 每升高5HRC降低~15%
      ratio = Math.pow(0.85, (hValue - typical) / 5);
    } else {
      // HB: 每升高50HB降低~12%
      ratio = Math.pow(0.88, (hValue - typical) / 50);
    }

    ratio = clamp(ratio, 0.3, 1.5);

    return {
      vcMin: baseVc[0] * ratio,
      vcMax: baseVc[1] * ratio
    };
  }

  // ==========================================
  // 5. 进给率基准 (按直径调整)
  // ==========================================
  function getFzBase(toolData, dia, mat) {
    // 基准 Fz 按直径缩放
    let base = toolData.fzBase;
    if (dia && dia > 0) {
      // 直径越大 Fz 可适当增大, 以 10mm 为基准
      const diaFactor = Math.pow(dia / 10, 0.3);
      base = base * diaFactor;
    }
    // 钛合金等难加工材料额外降低
    const matFactor = {
      titanium: 0.75,
      stainless: 0.85,
      die_steel: 0.85
    };
    const mf = matFactor[mat];
    if (mf) base *= mf;

    return base;
  }

  // ==========================================
  // 6. 工具方向判定
  // ==========================================
  function getToolDirection(mat, process, tool) {
    // 顺铣: 表面光洁度好, 适合精加工和稳定条件
    // 逆铣: 适合粗加工、硬皮、铸件
    if (process === "finish") return "climb";
    if (process === "rough") return "conventional";
    if (["cast_iron"].includes(mat) && process !== "finish") return "conventional";
    if (["aluminum", "copper"].includes(mat)) return "climb";
    if (["drill", "tap"].includes(process)) return "—";
    // 默认推荐顺铣（精加工倾向）
    return "climb";
  }

  // ==========================================
  // 7. 风险等级
  // ==========================================
  function getRiskLevel(mat, process, rigidity, clampVal, tool, hardness) {
    let score = 0;

    // 材料风险
    const matRisk = { titanium: 3, stainless: 2, die_steel: 2, steel_42crmo: 1 };
    if (matRisk[mat]) score += matRisk[mat];

    // 加工方式风险
    const processRisk = { tap: 3, slot: 2, drill: 1, rough: 1, side: 1 };
    if (processRisk[process]) score += processRisk[process];

    // 刚性风险
    if (rigidity === "poor") score += 2;
    else if (rigidity === "normal") score += 1;

    // 装夹风险
    const clampRisk = { chatter: 3, slender: 2, overhang: 1 };
    if (clampRisk[clampVal]) score += clampRisk[clampVal];

    // 硬度风险
    if (hardness !== null) {
      if (hardness > 350) score += 2;
      else if (hardness > 280) score += 1;
    }

    if (score >= 7) return "high";
    if (score >= 4) return "mid";
    return "low";
  }

  const RISK_LABELS = {
    low: { text: "低风险", cls: "risk-low" },
    mid: { text: "中风险", cls: "risk-mid" },
    high: { text: "高风险", cls: "risk-high" }
  };

  const RISK_WARNINGS = {
    low: "当前条件风险不高，可以按推荐范围的中低值试切。仍需观察声音、铁屑、刀具磨损和工件表面。",
    mid: "当前条件有一定风险，建议先从推荐范围的低值开始试切，重点观察震刀、崩刃、发热和尺寸稳定性。",
    high: "当前条件风险较高，不建议直接按高参数加工。请优先确认刀具牌号、装夹刚性、切深切宽、冷却方式，并从保守参数小余量试切。"
  };

  // ==========================================
  // 8. 生成推荐
  // ==========================================
  function generateRecommendation() {
    const mat = document.getElementById("material").value;
    const hType = document.getElementById("hardness_type").value;
    const hVal = toNum(document.getElementById("hardness_value").value);
    const process = document.getElementById("process").value;
    const tool = document.getElementById("tool").value;
    const dia = toNum(document.getElementById("tool_dia").value);
    const teeth = toNum(document.getElementById("tool_teeth").value);
    const rigidity = document.getElementById("rigidity").value;
    const clampVal = document.getElementById("clamp").value;

    // 验证必填项
    if (!dia || dia <= 0) {
      showResult("error", "请输入有效的刀具直径（正数）");
      return;
    }
    if (!teeth || teeth <= 0) {
      showResult("error", "请输入有效的刀具刃数（正整数）");
      return;
    }

    // 获取材料规则
    const rule = getMaterialRule(mat, tool);
    if (!rule) {
      showResult("error", "该材料与刀具组合暂不支持，请选择其他组合");
      return;
    }

    const baseVc = rule.toolData.vc;

    // 硬度调整
    const adjVc = applyHardnessAdjust(mat, hType, hVal, baseVc);

    // 加工方式调整
    const procFactor = PROCESS_ADJUST[process] || 1.0;
    let vcMin = adjVc.vcMin * procFactor;
    let vcMax = adjVc.vcMax * procFactor;

    // 刚性调整
    const rigFactor = RIGIDITY_ADJUST[rigidity] || 1.0;
    vcMin *= rigFactor;
    vcMax *= rigFactor;

    // 装夹调整
    const clampFactor = CLAMP_ADJUST[clampVal] || 1.0;
    vcMin *= clampFactor;
    vcMax *= clampFactor;

    // 计算转速
    const sMin = Math.round((1000 * vcMin) / (Math.PI * dia));
    const sMax = Math.round((1000 * vcMax) / (Math.PI * dia));

    // 进给率
    const fzBase = getFzBase(rule.toolData, dia, mat);
    const fzFactor = clamp(procFactor * rigFactor * clampFactor, 0.3, 1.2);
    const fzMin = fzBase * fzFactor * 0.6;
    const fzMax = fzBase * fzFactor * 1.2;

    const fMin = Math.round(sMin * teeth * fzMin);
    const fMax = Math.round(sMax * teeth * fzMax);

    // 风险等级
    const risk = getRiskLevel(mat, process, rigidity, clampVal, tool, hVal);
    const riskInfo = RISK_LABELS[risk];
    const riskWarning = RISK_WARNINGS[risk];

    // 刀具方向
    const dir = getToolDirection(mat, process, tool);
    const dirLabels = {
      climb: { text: "推荐顺铣", cls: "dir-climb" },
      conventional: { text: "推荐逆铣", cls: "dir-conventional" },
      "—": { text: "—", cls: "" }
    };
    const dirInfo = dirLabels[dir] || { text: "—", cls: "" };

    // 调整建议
    let adjTips = [];
    if (rigFactor < 0.9) adjTips.push("机床刚性偏低，建议降低切深和切宽");
    if (clampFactor < 0.8) adjTips.push("装夹条件受限，建议增加支撑或减少悬伸");
    if (["titanium", "stainless"].includes(mat)) adjTips.push("难加工材料，务必确保充分冷却");
    if (process === "slot") adjTips.push("槽铣排屑困难，建议使用啄铣或螺旋下刀");
    if (hVal !== null && hVal > 280) adjTips.push("材料硬度偏高，建议使用耐磨涂层刀具");
    if (risk === "high") adjTips.push("⚠ 高风险加工，强烈建议先试切确认再批量加工");

    if (adjTips.length === 0) adjTips.push("当前条件较理想，按推荐参数试切即可");

    // 渲染
    const matName = MATERIAL_RULES[mat].name;
    const toolName = TOOL_NAMES[tool] || tool;

    const html = `
      <div class="result-card fade-in">
        <div class="item">
          <span class="label">材料/刀具</span>
          <span class="value">${matName} + ${toolName}</span>
        </div>
        <div class="item">
          <span class="label">推荐刀具方向</span>
          <span class="value"><span class="tool-dir-badge ${dirInfo.cls}">${dirInfo.text}</span></span>
        </div>
        <div class="item">
          <span class="label">推荐线速度 Vc</span>
          <span class="value">${fmtRange(vcMin, vcMax, "m/min")}</span>
        </div>
        <div class="item">
          <span class="label">推荐主轴转速 S</span>
          <span class="value">${fmtRange(sMin, sMax, "rpm")}</span>
        </div>
        <div class="item">
          <span class="label">推荐每齿进给 Fz</span>
          <span class="value">${fmtRange(fzMin, fzMax, "mm/tooth")}</span>
        </div>
        <div class="item">
          <span class="label">推荐每分钟进给 F</span>
          <span class="value">${fmtRange(fMin, fMax, "mm/min")}</span>
        </div>
        <div class="item">
          <span class="label">风险等级</span>
          <span class="value"><span class="${riskInfo.cls}">${riskInfo.text}</span></span>
        </div>
      </div>
      <div class="result-card fade-in" style="margin-top:12px;">
        <div class="item" style="border-bottom: none; flex-direction: column; align-items: flex-start; gap: 6px;">
          <span class="label" style="margin-bottom:4px;">⚠ 风险提醒</span>
          <span style="font-size:0.85rem;line-height:1.6;color:var(--text);">${riskWarning}</span>
        </div>
      </div>
      <div class="result-card fade-in" style="margin-top:12px;">
        <div class="item" style="border-bottom: none; flex-direction: column; align-items: flex-start; gap: 6px;">
          <span class="label" style="margin-bottom:4px;">💡 调整建议</span>
          <ul style="font-size:0.85rem;line-height:1.8;color:var(--text);padding-left:18px;margin:0;">
            ${adjTips.map(t => `<li>${t}</li>`).join("")}
          </ul>
        </div>
      </div>
    `;

    document.getElementById("resultArea").innerHTML = html;
  }

  function showResult(type, msg) {
    const cls = type === "error" ? "warning-text" : "tip-text";
    document.getElementById("resultArea").innerHTML = `
      <div class="result-card fade-in" style="text-align:center;">
        <div class="${cls}" style="font-size:1rem;">${msg}</div>
      </div>
    `;
  }

  // ==========================================
  // 9. 参数计算器 (Tab 2)
  // ==========================================
  function setupCalculators() {
    const cards = document.querySelectorAll(".calc-card");

    // 折叠/展开
    cards.forEach(card => {
      const header = card.querySelector(".calc-card-header");
      header.addEventListener("click", function () {
        const body = card.querySelector(".calc-card-body");
        body.classList.toggle("hidden");
        header.classList.toggle("collapsed");
      });
    });

    // 计算按钮
    document.querySelectorAll(".calc-btn").forEach(btn => {
      btn.addEventListener("click", function () {
        const card = this.closest(".calc-card");
        const calcId = card.dataset.calc;
        const inputs = card.querySelectorAll(".calc-input");
        const resultEl = card.querySelector(".calc-result");

        const a = toNum(inputs[0]?.value);
        const b = toNum(inputs[1]?.value);
        const c = toNum(inputs[2]?.value);

        let val, unit;

        switch (calcId) {
          case "calc1": // Vc → S
            if (a === null || b === null || b <= 0) { resultEl.textContent = "请先输入正确的正数参数"; return; }
            val = Math.round((1000 * a) / (Math.PI * b));
            unit = "rpm";
            break;
          case "calc2": // S → Vc
            if (a === null || b === null || b <= 0) { resultEl.textContent = "请先输入正确的正数参数"; return; }
            val = (Math.PI * b * a) / 1000;
            unit = "m/min";
            break;
          case "calc3": // Fz → F
            if (a === null || b === null || c === null || b <= 0) { resultEl.textContent = "请先输入正确的正数参数"; return; }
            val = Math.round(a * b * c);
            unit = "mm/min";
            break;
          case "calc4": // f → F
            if (a === null || b === null) { resultEl.textContent = "请先输入正确的正数参数"; return; }
            val = Math.round(a * b);
            unit = "mm/min";
            break;
          case "calc5": // TPI → P
            if (a === null || a <= 0) { resultEl.textContent = "请先输入正确的正数参数"; return; }
            val = (25.4 / a).toFixed(3);
            unit = "mm";
            break;
          case "calc6": // R → D
            if (a === null || a < 0) { resultEl.textContent = "请先输入正确的正数参数"; return; }
            val = (2 * a).toFixed(1);
            unit = "mm";
            break;
          default:
            resultEl.textContent = "未知计算器";
            return;
        }

        resultEl.textContent = `${val} ${unit}`;
      });
    });
  }

  // ==========================================
  // 10. 异常排查数据 (Tab 3)
  // ==========================================
  const DIAGNOSIS_DATA = [
    {
      title: "老是崩刃",
      causes: [
        "进给过大或切深过大",
        "刀具牌号选择偏脆（硬质合金牌号过硬）",
        "工件材料硬度不均或含硬质点",
        "刀具悬伸过长导致受力偏摆",
        "切削刃有微裂纹或已钝化",
        "冷却不足导致热冲击崩刃"
      ],
      checkOrder: [
        "检查刀具刃口状态（放大镜观察）",
        "确认进给率和切深是否在推荐范围内",
        "检查工件材料是否有硬皮、夹砂或硬度突变",
        "确认刀具悬伸长度（建议 ≤ 3~4倍直径）",
        "检查主轴跳动和刀柄精度"
      ],
      advice: "崩刃通常不是单一原因。先确认刀具质量和悬伸，再看参数是否过激进。不要一崩刃就只降转速，先降进给和切深更合理。",
      prevention: "根据材料硬度选择合适的刀具牌号，粗加工使用韧性更好的牌号，精加工再换耐磨牌号。"
    },
    {
      title: "加工声音发闷",
      causes: [
        "切削参数偏低（速度不够、进给不够）",
        "刀具已磨损（后刀面磨损带过宽）",
        "切深过小导致刮擦而非切削",
        "排屑不畅，切屑堵塞"
      ],
      checkOrder: [
        "先听声音位置——刀具处还是工件处",
        "检查刀具磨损状态",
        "适当提高转速或进给",
        "检查排屑是否通畅"
      ],
      advice: "发闷声通常意味着刀具在挤压而不是切削。如果参数已经在推荐范围内，优先检查刀具是否该换刃了。",
      prevention: "定期检查刀具磨损，记录刀具寿命。"
    },
    {
      title: "刀具发红 / 烧刀",
      causes: [
        "转速过高导致摩擦发热过大",
        "进给过小导致摩擦时间过长",
        "冷却不足或冷却不到位",
        "刀具涂层已失效",
        "切深过大导致切削区温度过高"
      ],
      checkOrder: [
        "检查冷却液是否对准切削区",
        "确认转速是否过高（核算线速度）",
        "检查进给是否偏低",
        "检查刀具涂层状态",
        "验证切深切宽是否合理"
      ],
      advice: "烧刀先看冷却！冷却不到位的话调参数也没用。确认冷却液压力和喷嘴对准切削区。再查转速是否超了推荐范围。",
      prevention: "加工时注意观察铁屑颜色——发蓝发紫说明温度过高，需降转速或加冷却。"
    },
    {
      title: "表面有震纹",
      causes: [
        "刀具悬伸过长",
        "工件刚性不足或装夹不稳",
        "主轴转速与机床产生共振",
        "每齿进给偏大",
        "刀具刃数选择不当",
        "刀柄动平衡不良"
      ],
      checkOrder: [
        "减少刀具悬伸",
        "检查装夹稳定性（工件是否跳动）",
        "尝试调整转速（避开共振区间）",
        "降低每齿进给或使用变距刀具"
      ],
      advice: "震纹优先查刚性——缩悬伸、加固装夹。如果调刚性有困难，尝试改变转速（±10%~20%）避开共振区间。",
      prevention: "设计工艺时优先考虑刀具悬伸、工件支撑和机床刚性匹配。"
    },
    {
      title: "尺寸一头大一头小",
      causes: [
        "工件刚性差，加工时发生让刀",
        "刀具磨损不均（切入端与切出端磨损不同）",
        "工件装夹导致变形",
        "机床导轨间隙或反向间隙未补偿",
        "余量不均匀"
      ],
      checkOrder: [
        "在机床上打表确认工件位置",
        "检查两端余量差异",
        "检查刀具磨损情况",
        "检查机床反向间隙补偿",
        "考虑调整走刀方向或加工顺序"
      ],
      advice: "这通常是让刀或工件变形。先检查装夹方式和加工顺序，考虑从两端分别加工或增加支撑。不要只调刀补。",
      prevention: "细长件加工前先做应力释放，加工时增加辅助支撑。"
    },
    {
      title: "尺寸合格但环规下不去",
      causes: [
        "单项尺寸合格，但综合形位误差超差",
        "工件太长，刚性差，加工时发生让刀",
        "两处花键或键槽同轴度不好",
        "齿形、齿向、倒角或毛刺影响通过",
        "装夹、顶尖、中心孔或支撑状态不稳定",
        "加工后应力释放或热处理变形",
        "检测方法只看单项尺寸，没有做综合通止规验"
      ],
      checkOrder: [
        "先检查毛刺和倒角",
        "检查环规具体卡在哪一段",
        "检查两处花键或键槽的同轴度",
        "检查工件跳动和支撑方式",
        "检查齿形、齿向、跨棒距或相关综合尺寸",
        "复查加工顺序和装夹方式"
      ],
      advice: "尺寸合格但环规不过，不要只盯单个尺寸。环规看的是综合通过性，要重点查形位误差、毛刺、同轴度和工件变形。",
      prevention: "加工前确认基准一致性，控制热处理变形，检测时做综合通止规校验。"
    },
    {
      title: "孔合格但轴装不进去",
      causes: [
        "孔口毛刺或倒角不够",
        "孔的圆度和圆柱度超差",
        "孔壁粗糙度太差，实际配合过紧",
        "热装后冷却收缩量没算准",
        "轴的直线度或圆度也需复检"
      ],
      checkOrder: [
        "检查孔口倒角和毛刺",
        "用内径百分表检查圆度/圆柱度",
        "检测粗糙度对比样块确认",
        "检查是否加工发热导致冷却后变形"
      ],
      advice: "先看孔口倒角，很多配合问题就是差了倒角或多了毛刺。如果倒角没问题再查圆度和圆柱度。",
      prevention: "精加工后增加去毛刺工序，关键配合面标注圆度要求。"
    },
    {
      title: "键槽尺寸合格但装配不顺",
      causes: [
        "键槽对称度超差",
        "键槽位置度偏差大",
        "槽底粗糙度过大",
        "键的尺寸未按配合公差选配",
        "两处键槽的同轴度不好"
      ],
      checkOrder: [
        "检查键槽对称度",
        "检查键槽位置度（到基准的距离）",
        "检查槽底粗糙度",
        "实测键的宽度与槽的宽度匹配",
        "检查两端键槽同轴度"
      ],
      advice: "键槽装配问题通常不是宽度的问题，而是对称度和位置度。建议用键槽对称度量具或打表确认。",
      prevention: "铣键槽时使用对刀仪或寻边器确认中心，标注对称度要求。"
    },
    {
      title: "毛刺太大",
      causes: [
        "刀具磨损（刃口钝化）",
        "精加工余量偏大",
        "进给率偏大",
        "加工顺序不合理（切出方向造成毛刺）",
        "材料塑性大（如铝合金、铜）"
      ],
      checkOrder: [
        "检查刀具刃口锋利度",
        "确认精加工余量是否合理（建议 0.2~0.5mm）",
        "适当降低精加工进给",
        "调整走刀方向——从工件内部切出而非边缘"
      ],
      advice: "毛刺大先换刀或磨刃——钝刀是毛刺的头号原因。精加工用顺铣可显著减少毛刺。铝合金等软材料可以考虑使用倒角刀做去毛刺工序。",
      prevention: "安排专门的去毛刺工序，或使用毛刷、倒角刀一次走刀完成。"
    },
    {
      title: "加工后尺寸不稳定",
      causes: [
        "刀具磨损快，尺寸漂移",
        "工件装夹不稳定（每次装夹位置有变化）",
        "冷却不均匀导致热变形",
        "加工余量不均匀",
        "机床热漂移（开机预热不足）",
        "材料内应力释放导致变形"
      ],
      checkOrder: [
        "检查刀具磨损趋势——首件与末件对比",
        "确认装夹重复定位精度",
        "检查机床是否充分预热",
        "检查冷却是否稳定",
        "考虑增加半精加工再精加工"
      ],
      advice: "尺寸不稳定先分两类：趋势性变化（刀具磨损/热漂移）还是随机性变化（装夹/材料）。趋势性变化补偿或换刀，随机性先解决装夹。",
      prevention: "建立首件检验和定期抽检制度，记录每件尺寸便于分析趋势。"
    }
  ];

  function renderDiagnosis() {
    const container = document.getElementById("diagList");
    container.innerHTML = DIAGNOSIS_DATA.map((item, idx) => `
      <div class="diag-item" data-diag="${idx}">
        <span>${idx + 1}. ${item.title}</span>
        <span class="arrow-icon">›</span>
      </div>
      <div class="diag-detail" id="diagDetail${idx}">
        <h4>📌 可能原因</h4>
        <ul>${item.causes.map(c => `<li>${c}</li>`).join("")}</ul>
        <h4>🔍 优先检查顺序</h4>
        <ol>${item.checkOrder.map(c => `<li>${c}</li>`).join("")}</ol>
        <h4>💡 现场处理建议</h4>
        <div class="highlight-box">${item.advice}</div>
        <h4>🛡 下次预防方法</h4>
        <div class="highlight-box" style="border-left-color:var(--teal);background:rgba(15,118,110,0.06);">${item.prevention}</div>
      </div>
    `).join("");

    // 点击展开
    container.querySelectorAll(".diag-item").forEach(el => {
      el.addEventListener("click", function () {
        const idx = this.dataset.diag;
        const detail = document.getElementById(`diagDetail${idx}`);
        const isOpen = detail.classList.contains("open");

        // 关闭所有
        document.querySelectorAll(".diag-detail.open").forEach(d => d.classList.remove("open"));

        if (!isOpen) {
          detail.classList.add("open");
          // 滚动到该位置
          setTimeout(() => detail.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
        }
      });
    });
  }

  // ==========================================
  // 11. 初始化
  // ==========================================
  function init() {
    // Tab切换
    document.querySelectorAll(".tab-btn").forEach(btn => {
      btn.addEventListener("click", function () {
        const tabId = this.dataset.tab;

        document.querySelectorAll(".tab-btn").forEach(b => {
          b.classList.remove("active");
          b.setAttribute("aria-selected", "false");
        });
        this.classList.add("active");
        this.setAttribute("aria-selected", "true");

        document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
        document.getElementById(tabId).classList.add("active");
      });
    });

    // 生成建议
    document.getElementById("btnGenerate").addEventListener("click", generateRecommendation);

    // 清空
    document.getElementById("btnClear").addEventListener("click", function () {
      document.querySelectorAll("#tab1 select").forEach(s => s.selectedIndex = 0);
      document.querySelectorAll("#tab1 input").forEach(i => i.value = "");
      document.getElementById("resultArea").innerHTML = "";
      document.getElementById("hardness_type").value = "hb";
    });

    // 填入示例
    document.getElementById("btnExample").addEventListener("click", function () {
      document.getElementById("material").value = "steel_45";
      document.getElementById("hardness_type").value = "hb";
      document.getElementById("hardness_value").value = "220";
      document.getElementById("process").value = "side";
      document.getElementById("tool").value = "coated";
      document.getElementById("tool_dia").value = "10";
      document.getElementById("tool_teeth").value = "4";
      document.getElementById("rigidity").value = "normal";
      document.getElementById("clamp").value = "stable";
    });

    // 硬度类型切换
    document.getElementById("hardness_type").addEventListener("change", function () {
      const valInput = document.getElementById("hardness_value");
      if (this.value === "unknown") {
        valInput.value = "";
        valInput.placeholder = "未知，可不填";
      } else {
        valInput.placeholder = "如 220";
      }
    });

    // 设置计算器
    setupCalculators();

    // 渲染异常排查
    renderDiagnosis();
  }

  // DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

