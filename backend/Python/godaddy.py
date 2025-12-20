from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options

def godaddy_login():
    # Path to chromedriver
    service = Service("C:/Program Files (x86)/chromedriver-win64/chromedriver.exe")

    options = Options()
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option("detach", True)  # Keep Chrome open after script ends
    options.add_argument("--start-maximized")        # Maximize window
    # options.add_argument("--headless")             # <-- REMOVE headless if present

    chrome = webdriver.Chrome(service=service, options=options)
    chrome.get("https://sso.godaddy.com/?app=dcc&path=%2Fcontrol%2Fportfolio%3Fplid%3D")

    username = chrome.find_element(By.ID, "username")
    username.send_keys("188797785")
    password = chrome.find_element(By.ID, "password")
    password.send_keys("loremipsum208")
    submit = chrome.find_element(By.ID, "submitBtn")
    submit.click()

    print("✅ GoDaddy login script executed, Chrome should be visible now!")
    input("Press Enter to quit and close Chrome...")  # keep tab open until you press Enter

if __name__ == "__main__":
    godaddy_login()
