from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 390, "height": 844})
    page_errors = []
    page.on("pageerror", lambda err: page_errors.append(str(err)))
    
    page.goto("http://localhost:8080", wait_until="networkidle", timeout=15000)
    page.wait_for_timeout(800)
    
    print("=== Test 1: Generate with data ===")
    page.fill("#tool_dia", "10")
    page.fill("#tool_teeth", "4")
    page.click("#btnGenerate")
    page.wait_for_timeout(400)
    result = page.eval_on_selector("#resultArea", "el => el.textContent")
    print(f"  Errors: {page_errors}")
    for keyword in ["推荐结果", "推荐刀具方向", "推荐线速度", "推荐主轴转速", "风险提醒", "老师傅"]:
        print(f"  '{keyword}': {keyword in result}")
    
    print("\n=== Test 2: Clear button ===")
    page.click("#btnClear")
    page.wait_for_timeout(200)
    dia_val = page.eval_on_selector("#tool_dia", "el => el.value")
    result_empty = page.eval_on_selector("#resultArea", "el => el.innerHTML")
    print(f"  Diameter cleared: {dia_val == ''}")
    print(f"  Result cleared: {len(result_empty) == 0}")
    
    print("\n=== Test 3: Example fill ===")
    page.click("#btnExample")
    page.wait_for_timeout(200)
    mat_val = page.eval_on_selector("#material", "el => el.value")
    dia_val = page.eval_on_selector("#tool_dia", "el => el.value")
    print(f"  material=steel_45: {mat_val == 'steel_45'}")
    print(f"  dia=10: {dia_val == '10'}")
    page.click("#btnGenerate")
    page.wait_for_timeout(400)
    result = page.eval_on_selector("#resultArea", "el => el.textContent")
    print(f"  Generate with example: {'45钢' in result and '涂层刀' in result}")
    print(f"  Errors: {page_errors}")
    
    print("\n=== Test 4: Empty validation ===")
    page.fill("#tool_dia", "")
    page.fill("#tool_teeth", "")
    page.click("#btnGenerate")
    page.wait_for_timeout(300)
    result = page.eval_on_selector("#resultArea", "el => el.textContent")
    print(f"  Shows error: {'请输入有效' in result}")
    
    print(f"\n=== FINAL: Total page errors = {len(page_errors)} ===")
    browser.close()
