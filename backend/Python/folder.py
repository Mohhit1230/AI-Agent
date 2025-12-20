
from playwright.sync_api import sync_playwright

search = input("What to search: ")

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)   # headless=True for no UI
    context = browser.new_context()                # like a clean profile
    page = context.new_page()

    page.goto("https://www.youtube.com/")


    try:
        page.fill('.ytSearchboxComponentInput',search)
    except Exception:
        print("error")
        # sometimes the prompt might be a div[contenteditable] or different selector
        # try:
        #     page.fill("input[tag='textarea']", search)
        # except Exception:
        #     # last resort: use locator and type
        #     locator = page.locator("textarea[name='prompt-textarea'], input[name='prompt-textarea'], [contenteditable='true']")
        #     locator.first.fill(search)

    # Click submit

    try:
        page.click(".ytSearchboxComponentSearchButton")
        print("clicckkk")
    except Exception:
        print("⚠️ Couldn't find submit button")

    # keep browser open a bit so you can see results
    input("Quit: ")
    browser.close()
