from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 390, "height": 900})
    
    page.goto("http://localhost:8080", wait_until="networkidle", timeout=15000)
    page.wait_for_timeout(500)
    
    # Fill data and generate
    page.select_option("#material", "steel_45")
    page.select_option("#hardness_type", "hb")
    page.fill("#hardness_value", "220")
    page.select_option("#process", "side")
    page.select_option("#tool", "coated")
    page.fill("#tool_dia", "10")
    page.fill("#tool_teeth", "4")
    page.select_option("#rigidity", "normal")
    page.select_option("#clamp", "stable")
    page.click("#btnGenerate")
    page.wait_for_timeout(500)
    
    page.screenshot(path="F:\\AI工作台\\cnc-parameter-demo\\_v2_preview.png", full_page=True)
    print("Screenshot saved!")
    browser.close()
