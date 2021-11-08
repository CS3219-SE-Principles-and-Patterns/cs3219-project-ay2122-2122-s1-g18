import requests
import json
import time
from bs4 import BeautifulSoup

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

from pymongo import MongoClient
from decouple import config

conn_str = config('MONGO_URI') + "&ssl=true&ssl_cert_reqs=CERT_NONE"
# set a 5-second connection timeout
client = MongoClient(conn_str, serverSelectionTimeoutMS=5000)
try:
    client.server_info()
    questions_db = client.cs3219Project.codingquestions
    print("Connected to database")
except Exception as e:
    print("Unable to connect to database.")

# Setup Selenium Webdriver
CHROMEDRIVER_PATH = r"./driver/chromedriver.exe"
options = Options()
options.headless = True
# Disable Warning, Error and Info logs
# Show only fatal errors
options.add_argument("--log-level=3")
driver = webdriver.Chrome(executable_path=CHROMEDRIVER_PATH, options=options)

def update_tracker(problem_num):
     with open('tracker.txt', "w") as f:
         f.write(str(problem_num))

def read_tracker():
    with open('tracker.txt', "r") as f:
        return int(f.readline())

def main():
    # Leetcode API URL to get json of problems in the algorithms category
    ALGORITHMS_ENDPOINT_URL = 'https://leetcode.com/api/problems/algorithms/'
    ALGORITHMS_BASE_URL = "https://leetcode.com/problems/"

    # Load JSON from API
    algorithms_problems_json = requests.get(ALGORITHMS_ENDPOINT_URL).content
    algorithms_problems_json = json.loads(algorithms_problems_json)

    results = []
    for child in algorithms_problems_json["stat_status_pairs"]:
            # Only process free problems
            if not child["paid_only"]:
                question__title_slug = child["stat"]["question__title_slug"]
                question__title = child["stat"]["question__title"]
                frontend_question_id = child["stat"]["frontend_question_id"]
                difficulty = child["difficulty"]["level"]

                results.append((frontend_question_id, difficulty, question__title, question__title_slug))


    results = sorted(results, key=lambda x: (x[0]))

    last_index_scraped = read_tracker()

    # Problem URL is of format ALGORITHMS_BASE_URL + question__title_slug
    # If question__title_slug = "two-sum" then URL is https://leetcode.com/problems/two-sum
    for i in range(last_index_scraped + 1, len(results)):
        result = results[i]
        url = ALGORITHMS_BASE_URL + result[3]
        driver.get(url)
        # Wait 20 secs or until div with id initial-loading disappears
        element = WebDriverWait(driver, 20).until(
            EC.invisibility_of_element_located((By.ID, "initial-loading"))
        )
        # Get current tab page source
        html = driver.page_source
        soup = BeautifulSoup(html, "html.parser")
        print(url)
        question_html = soup.find("div", {"class": "content__u3I1 question-content__JfgR"}).get_text()

        result = result + (question_html,)

        questions_db.insert_one({
        'frontend_question_id': result[0],
        "difficulty": result[1],
        "question_title": result[2],
        "question_text": result[4],
        "url": url})

        update_tracker(i)


if __name__ == "__main__":
    main()
