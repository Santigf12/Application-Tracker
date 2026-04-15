import os

from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException
from openai import OpenAI

from app.helpers.scraper import scrape_job_posting
from app.schemas.tools import CoverLetterRequest, ScrapePostingRequest

load_dotenv()

router = APIRouter()

client = OpenAI(
    organization=os.getenv("OPENAI_ORG_ID"),
    api_key=os.getenv("OPENAI_API_KEY"),
)

resume_info = """
Summary:
I am a highly motivated 4th-year Software Engineering student with a strong foundation in programming, software development, cloud platforms, and system administration. Passionate about solving complex problems and building innovative software solutions. Seeking a summer internship to further enhance technical skills and gain hands-on experience.

Skills:
• Programming Languages: Proficient in JavaScript, Python, Typescript, SQL, C/C++, and Java
• Version Control: Experienced with Git for source code management and collaboration (GitHub, Google Cloud Repositories).
• Containerization: Expertise in Docker and VMs for containerizing applications and managing deployments.
• Data Management: Proficient in SQL database design and management.
• System Administration: Adept at automation and system management using Ansible.
• Operating Systems: Proficient in daily use of Fedora, experienced in managing Ubuntu servers, and familiar with Buildroot for embedded system development.

Education:
Bachelor of Science in Software Engineering
Schulich School of Engineering, University of Calgary
Expected to graduate in April 2026.

Experience:
Research Assistant, I2Sense Laboratory, University of Calgary
September 2023 – Present
• Engineered and administered React Redux applications with Express back ends, facilitating efficient survey collection and research operations.
• Created multiple Cloud Build files for continuous automatic deployment within Google Artifact Registry.
• Containerized web applications using Docker, optimizing deployments for React and Express services.
• Utilized Google Cloud Secret Manager, ensuring best practices in credential and secrets management.
• Managed automated web analytics reporting PDF generation using a Django back-end server.
• Designed SQL schema architectures for research data management, emphasizing hierarchical organization and data integrity.
• Automated deployment of web applications using Ansible in conjunction with Portainer, leveraging Traefik for reverse proxy management and TLS certification.
• Managed a Unix Ubuntu server for Docker web services with Portainer, ensuring robust service availability.
• Collaborated within a research team using Git, leading to efficient project management and clean code practices.

Projects:
Job Tracker (October 2024)
• Developed an intuitive job tracking application using React Redux, Express server, and MySQL, managing personal job applications.
• Deployed using GitHub Actions to create personalized Docker images saved within GitHub Container Registry.
• Deployed on a personal home lab Unix Unraid Server within three different containers for the front-end, back-end, and MySQL.
• Accessed via personal domain address managed by Traefik reverse proxy with automatic DNS TLS configuration.

Note Taking App (March 2023)
• Integrated Google login authentication to ensure secure user access.
• Utilized AWS DynamoDB for scalable and reliable back-end data storage.
• Developed a responsive front-end using React and deployed via Netlify.

GitHub: https://github.com/Santigf12
Portfolio: https://santigf12.github.io/
"""


@router.post("/cover-letter")
def generate_cover_letter_content(payload: CoverLetterRequest):
    try:
        company = payload.company
        job_posting = payload.jobPosting

        if not company or not job_posting:
            raise HTTPException(
                status_code=400,
                detail="Company and job posting details are required",
            )

        prompt = f"""
You are an assistant that writes cover letters. Using the following job posting details, create a professional cover letter that highlights the candidate's qualifications, skills, and experience. The candidate's resume information is provided below.

Company Name: {company}

Job Posting Information:
{job_posting}

Resume Information:
{resume_info}

Please generate a cover letter for the job posting, focusing on how the candidate's skills and experience match the requirements of the position.
"""

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": "You are an assistant that writes cover letters.",
                },
                {"role": "user", "content": prompt},
            ],
            max_tokens=2000,
        )

        cover_letter = response.choices[0].message.content
        return cover_letter

    except HTTPException:
        raise
    except Exception as error:
        print("Error generating cover letter:", error)
        raise HTTPException(status_code=500, detail=str(error))


@router.post("/scrape-posting")
def scrape_posting(payload: ScrapePostingRequest):
    try:
        url = str(payload.url)

        if not url:
            raise HTTPException(status_code=400, detail="URL is required")

        response = scrape_job_posting(url)
        return response

    except HTTPException:
        raise
    except Exception as error:
        print("Error scraping job posting:", error)
        raise HTTPException(status_code=500, detail=str(error))