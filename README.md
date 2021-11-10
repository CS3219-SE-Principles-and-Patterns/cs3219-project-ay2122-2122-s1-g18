# SHReK Tech
[![cd](https://github.com/CS3219-SE-Principles-and-Patterns/cs3219-project-ay2122-2122-s1-g18/actions/workflows/cd.yml/badge.svg)](https://github.com/CS3219-SE-Principles-and-Patterns/cs3219-project-ay2122-2122-s1-g18/actions/workflows/cd.yml)
[![codecov](https://codecov.io/gh/CS3219-SE-Principles-and-Patterns/cs3219-project-ay2122-2122-s1-g18/branch/main/graph/badge.svg?token=MNRL3PMASU)](https://codecov.io/gh/CS3219-SE-Principles-and-Patterns/cs3219-project-ay2122-2122-s1-g18)

SHReK Tech aims to help students and job seekers boost their technical interview skills to land their dream job. In 
SHReK Tech, SHReKies can engage in real-time, collaborative programming to enhance their familiarity with technical 
interviews.

## Final Report
You can view our project's final report [here](18-FinalReport-2.pdf).

## Deployment
SHReK Tech is deployed on [https://shrektech.herokuapp.com/](https://shrektech.herokuapp.com/). You can give it a try!

## Local Build
If you would like to build our application locally, you can do so by following these steps:

### Prerequisites:
This application requires the following to be installed on your local computer:
- Node
- Python

### Clone our repository into your local computer:
1. Clone our repository using `git clone https://github.com/CS3219-SE-Principles-and-Patterns/cs3219-project-ay2122-2122-s1-g18.git`
2. Change directory to our repository using `cd cs3219-project-ay2122-2122-s1-g18`

### Create a `.env` file for the backend:
1. Change directory to the server folder using `cd server`
2. As our application requires a `.env` file, create your own:
- MongoDB database
- Gmail account
  - **Note:** For the purpose of using this account to send verification emails and reset password emails, you
  would need to enable 'less secure apps' settings for this Gmail account. A tutorial can be found here:
  [https://hotter.io/docs/email-accounts/secure-app-gmail/](https://hotter.io/docs/email-accounts/secure-app-gmail/).
- JWT secret key
3. Create a `.env` in the same directory with the content below:
```
MONGO_URI=<INSERT_YOUR_MONGO_URI_HERE>
JWT_SECRET_KEY=<INSERT_YOUR_SECRET_KEY_HERE>

GMAIL_HOST=smtp.gmail.com
GMAIL_SERVICE=gmail
GMAIL_USERNAME=<INSERT_YOUR_GMAIL_HERE>
GMAIL_PASSWORD=<INSERT_YOUR_GMAIL_ACCOUNT_PASSWORD_HERE>
```

### Scrape coding questions from Leetcode
1. Make sure your package tool is up-to-date with your package repositories using `sudo apt-get update`
2. `pip install` all the necessary modules
- `pip install beautifulsoup4`
- `pip install requests` 
- `python -m pip install pymongo` 
- `python -m pip install selenium` 
- `pip install python-decouple` 
- `pip install "pymongo[srv]"`
3. Run the scraper using `python ./utils/coding-questions-scraper/main.py` from the root of the project

**Note:** Leetcode may temporarily block requests. If this error occurs, wait for some time and try again.
Scraping progress is saved to the `tracker.txt` file, and scraping will resume from where it failed.

### Start the backend:
1. Change directory to the server folder using `cd server`
2. Install the necessary node modules using `npm install`
3. Run the backend using `npm start`

### Start the frontend:
1. Start a new terminal and change directory to the client folder using `cd client` from the root of the project
2. Install the necessary node modules using `npm install`
3. Run the frontend using `npm start`

### View the local build:
After following the previous steps, you may go to [http://localhost:8080/](http://localhost:8080/) and test out SHReK Tech!
