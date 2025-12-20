# from selenium import webdriver
# from selenium.webdriver.common.by import By
# from selenium.webdriver.chrome.service import Service
# from selenium.webdriver.chrome.options import Options
# from selenium.webdriver.support.ui import WebDriverWait
# from selenium.webdriver.support import expected_conditions as EC
#
# service = Service("C:/Program Files (x86)/chromedriver-win64/chromedriver.exe")
#
# options = Options()
# options.add_experimental_option("excludeSwitches", ["enable-automation"])
#
# search = input("What to search: ")
#
# chrome = webdriver.Chrome(options=options, service=service)
# chrome.get('https://ai-agent-mocha-pi.vercel.app/')
#
# wait = WebDriverWait(chrome, 10)
#
# # --- Accept Cookies ---
# # try:
# #     accept_btn = wait.until(
# #     EC.element_to_be_clickable((By.XPATH, "//button[.//span[text()='<<<']]")))
# #     accept_btn.click()
# #     print("✅ Cookies accepted")
# # except:
# #     print("⚠️ No cookies popup found")
#
# # --- Enter text ---
# username = chrome.find_element(By.TAG_NAME, 'textarea')
# username.send_keys(search)
# submit = chrome.find_element(By.XPATH, "//button[.//span[contains(text(),'>>>')]]")
# submit.click()
# res = chrome.find_element(By.CLASS_NAME,value='justify-start')
#
# print(res)
# input("Quit: ")



from playwright.sync_api import sync_playwright

search = input("What to search: ")

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)   # headless=True for no UI
    context = browser.new_context()                # like a clean profile
    page = context.new_page()

    page.goto("https://ai-agent-mocha-pi.vercel.app/")


    try:
        page.fill("textarea", search)
    except Exception:
        # sometimes the prompt might be a div[contenteditable] or different selector
        try:
            page.fill("input[tag='textarea']", search)
        except Exception:
            # last resort: use locator and type
            locator = page.locator("textarea[name='prompt-textarea'], input[name='prompt-textarea'], [contenteditable='true']")
            locator.first.fill(search)

    # Click submit

    try:
        page.click("span:has-text('<<<')")
    except Exception:
        print("⚠️ Couldn't find submit button")

    # keep browser open a bit so you can see results
    page.wait_for_timeout(3000)
    browser.close()
