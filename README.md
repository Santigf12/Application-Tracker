# Application Tracker

Application Tracker is a full-stack web application for tracking job applications, storing job posting details, generating tailored cover letters, uploading resume-related files, and creating merged application PDF packages.

The app is built with a Next.js frontend, a FastAPI backend, and a database-backed profile/resume system. It is designed to help manage the full job application workflow from saving a posting URL to generating application documents.

## Features

### Job Application Management

* Create and save job applications
* Track application status, such as Bookmarked, Applied, Interview, Offer, and Rejected
* Store key job information:

  * Job title
  * Company
  * Posting URL
  * Location
  * Position length
  * Full job posting text

### Job Posting Autofill

* Paste a job posting URL into the autofill form
* Automatically scrape job posting details
* Populate the application form with extracted information

### Cover Letter Generation

* Generate tailored cover letters based on:

  * Job title
  * Company name
  * Job posting content
  * Resume/profile information
* Save generated cover letters to the application record
* Download cover letters as formatted DOCX files

### Resume and File Management

* Upload resume files
* Upload supporting documents, such as transcripts
* View uploaded resume and other file records
* Delete uploaded files when needed

### Application PDF Merge

* Convert resume and cover letter files to PDF
* Merge resume, cover letter, and transcript into a single PDF package
* Download a complete application package for job submissions

### Profile-Based Resume Tailoring

* Store structured candidate profile data including:

  * Skills
  * Education
  * Work experience
  * Projects
  * Publications
* Select relevant experience and project bullets for specific job postings
* Generate tailored resume data based on job requirements

## Tech Stack

### Frontend

* Next.js
* React
* TypeScript
* Ant Design
* Ant Design Pro Components
* TanStack React Query
* Axios

### Backend

* FastAPI
* Python
* SQLAlchemy
* OpenAI API
* python-docx
* pypdf
* LibreOffice headless conversion

### Database

* SQL database accessed through SQLAlchemy

## Project Structure

```text
Application-Tracker/
├── backend/
│   ├── app/
│   │   ├── core/
│   │   │   └── db.py
│   │   ├── helpers/
│   │   │   ├── cover_letter_builder.py
│   │   │   ├── file_converter.py
│   │   │   ├── resume_builder.py
│   │   │   └── scraper.py
│   │   ├── routers/
│   │   │   ├── applications.py
│   │   │   ├── pdf.py
│   │   │   ├── profile.py
│   │   │   ├── resume.py
│   │   │   └── tools.py
│   │   ├── schemas/
│   │   └── main.py
│   ├── templates/
│   ├── tmp/
│   └── requirements.txt
│
└── frontend/
    ├── app/
    ├── lib/
    │   └── features/
    │       ├── applications/
    │       ├── files/
    │       └── tools/
    ├── components/
    └── package.json
```

## Getting Started

### Prerequisites

Make sure the following are installed:

* Node.js
* npm or pnpm
* Python
* LibreOffice
* A SQL database
* OpenAI API key

LibreOffice is required for converting DOCX and ODT files to PDF.

## Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Create and activate a virtual environment:

```bash
python -m venv .venv
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file:

```env
OPENAI_API_KEY=your_openai_api_key
OPENAI_ORG_ID=your_openai_org_id_optional
OPENAI_MODEL=gpt-5.4-mini

DATABASE=your_database_name
DATABASE_USER=your_database_user
DATABASE_PASSWORD=your_database_password
DATABASE_HOST=your_database_host
DATABASE_PORT=3306
```

Run the backend server:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 5000
```

The backend will run at:

```text
http://localhost:5000
```

## Frontend Setup

Navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create a frontend environment file if required:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Run the development server:

```bash
npm run dev
```

The frontend will run at:

```text
http://localhost:3000
```

## Main API Areas

### Applications

Used for creating, updating, reading, and tracking job applications.

Example application fields:

```json
{
  "title": "Software Developer",
  "company": "Example Company",
  "url": "https://example.com/job-posting",
  "location": "Calgary, AB",
  "length": "12 Months",
  "posting": "Full job posting content...",
  "status": "Bookmarked"
}
```

### Tools

Used for automation and AI-assisted features.

Main features:

* Scrape job posting details from a URL
* Generate tailored cover letter content
* Tailor profile/resume content to a job posting

### Files and PDFs

Used for uploading, downloading, converting, and merging files.

Main features:

* Upload resume
* Upload other files
* Generate cover letter DOCX
* Convert documents to PDF
* Merge resume, cover letter, and transcript into a single PDF

## Cover Letter Generation Flow

1. User creates or opens a job application.
2. The app loads the company, position, and job posting.
3. The user clicks Generate Cover Letter.
4. The backend sends the posting and resume/profile information to the AI model.
5. The generated cover letter is returned to the frontend.
6. The user can edit and save the cover letter.
7. The user can download a formatted DOCX cover letter.

## Resume Tailoring Flow

1. The backend loads the full candidate profile from the database.
2. The AI model reviews the job posting.
3. The AI model selects the most relevant:

   * Experience bullets
   * Project bullets
   * Publication inclusion decision
4. The backend returns a tailored resume profile response.
5. The frontend can use this data to generate a tailored resume.

## File Generation

The app generates formatted DOCX files using `python-docx`.

Cover letters use a resume-style header with:

* Candidate name
* Phone number
* Email
* Location
* GitHub link
* Personal website link

The cover letter also includes a company/date row styled similarly to the resume section headings.

## Development Notes

### Running Backend Locally

```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 5000
```

### Running Frontend Locally

```bash
cd frontend
npm run dev
```

### Checking Backend Imports

```bash
python -c "from app.helpers.cover_letter_builder import generate_cover_letter_docx; print('ok')"
```

### Searching for Old ODT Cover Letter Code

```bash
grep -R "generate_cover_letter_odt" -n .
grep -R "Cover Letter.odt" -n .
grep -R "application/vnd.oasis.opendocument.text" -n .
```

## Planned Improvements

* Add persistent custom location suggestions
* Improve job posting scraper coverage
* Add more detailed application analytics
* Add resume preview before download
* Add support for multiple resume versions
* Add automated status reminders
* Add better file cleanup for temporary generated documents

## License

This project is licensed under the MIT License.

```text
MIT License

Copyright (c) 2026 Santiago Fuentes

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell   
copies of the Software, and to permit persons to whom the Software is       
furnished to do so, subject to the following conditions:                   

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.                            

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR  
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,    
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER      
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.