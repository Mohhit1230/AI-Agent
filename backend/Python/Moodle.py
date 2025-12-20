
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options

def moodle_login():
    service = Service("C:/Program Files (x86)/chromedriver-win64/chromedriver.exe")

    options = Options()
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option("detach", True)  # Keep Chrome open after script ends
    options.add_argument("--start-maximized")        # Maximize window
    # options.add_argument("--headless")             # <-- REMOVE headless if present

    chrome = webdriver.Chrome(service=service, options=options)
    chrome.get('https://moodle.manit.ac.in/login/index.php')

    username = chrome.find_element(By.ID, 'username')
    username.send_keys("2311201281")
    password = chrome.find_element(By.ID, 'password')
    password.send_keys("MoHIt0208@")
    submit = chrome.find_element(By.ID, 'loginbtn')
    submit.click()

    input("Quit")

if __name__ == "__main__":
    moodle_login()






# from playwright.sync_api import sync_playwright


# def moodle_login():
#     p=sync_playwright()
#     browser = p.chromium.launch(headless=False)   # headless=True for no UI
#     context = browser.new_context()                # like a clean profile
#     page = context.new_page()

#     page.goto("https://moodle.manit.ac.in/login/index.php")


#     try:
#         page.fill('#username', "2311201281")
#     except Exception:
#         print("error")
#         # sometimes the prompt might be a div[contenteditable] or different selector
#         # try:
#         #     page.fill("input[tag='textarea']", search)
#         # except Exception:
#         #     # last resort: use locator and type
#         #     locator = page.locator("textarea[name='prompt-textarea'], input[name='prompt-textarea'], [contenteditable='true']")
#         #     locator.first.fill(search)
#     page.fill('#password', "MoHIt0208@")
#     # Click submit

#     try:
#         page.click("#loginbtn")
#     except Exception:
#         print("⚠️ Couldn't find submit button")

#     # keep browser open a bit so you can see results
#     input("Quit: ")
    
