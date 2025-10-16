# NYC Taxi Trip Analytics

Enterprise-level web application for analyzing and visualizing NYC taxi trips.  
Provides insights on trip counts, fares, distances, and pickup locations using a clean interactive interface.

---

## Table of Contents

1. [Features](#features)
2. [Dataset](#dataset)
3. [Project Structure](#project-structure)
4. [Setup Instructions](#setup-instructions)
5. [Usage](#usage)
6. [Tech Stack](#tech-stack)

---

## Features

- Interactive dashboard with stats cards: Total Trips, Total Revenue, Avg Distance, Avg Fare.
- Filter trips by date, fare, and distance.
- Hourly trip trends and geographic distribution charts.
- Paginated trip table with sorting functionality.
- Responsive and modern UI design.

---

## Dataset

- Dataset: NYC Taxi Trip Duration (CSV format)
- Fields include pickup and dropoff times, passenger count, trip distance, fare, tip, and locations.
- CSV is stored in `backend/data/taxi_data.csv`.

---

## Project Structure

```

backend/           # Python backend and database scripts
frontend/          # UI files (HTML, CSS, JS)
README.md          # Project documentation

````

---

## Setup Instructions

### Prerequisites

- Python 3.9+
- pip
- Node.js (optional, if using local dev server for frontend)
- Git

### Backend Setup

1. Navigate to the backend folder:
```bash
cd backend
````

2. Create a virtual environment:

```bash
python -m venv venv
```

3. Activate the virtual environment:

* Windows:

```bash
venv\Scripts\activate
```

* Mac/Linux:

```bash
source venv/bin/activate
```

4. Install dependencies:

```bash
pip install -r requirements.txt
```

5. Create the database:

```bash
python create_database.py
```

6. Run the backend server:

```bash
python app.py
```

Backend will start on `http://localhost:5011`.

### Frontend Setup

1. Navigate to the frontend folder:

```bash
cd frontend
```

2. Open `index.html` in your browser or serve it using a local server (e.g., Live Server extension for VSCode).

---

## Usage

1. Open the dashboard in your browser.
2. Apply filters to analyze trips.
3. View charts and stats.
4. Paginate and sort trip records in the table.

---

## Tech Stack

* **Backend**: Python, Flask/FastAPI, SQLite
* **Frontend**: HTML, CSS, JavaScript, Chart.js
* **Database**: SQLite
* **Tools**: VSCode, Git, GitHub

---
## Documentation
1. here is the link to the database dump but they will ask you to downlaod it first because it's large
[Download NYC database dump)](https://drive.google.com/file/d/1oQkvdsvp8r6VyG9z9LsYwNRCCrfeYKRV/view?usp=sharing)

2. Below is the video demo link
   [DEMO VIDEO)](https://drive.google.com/file/d/1_C5-mUTLNnDKueLnfUd4hPbGGWJOMYSH/view?usp=sharing)

3. Report of our application
   

