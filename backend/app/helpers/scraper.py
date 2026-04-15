import os
import re
from typing import Optional

import requests
from bs4 import BeautifulSoup
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(
    organization=os.getenv("OPENAI_ORG_ID"),
    api_key=os.getenv("OPENAI_API_KEY"),
)


def scrape_job_posting(job_url: str) -> Optional[dict]:
    try:
        response = requests.get(
            job_url,
            timeout=30,
            headers={
                "User-Agent": (
                    "Mozilla/5.0 (X11; Linux x86_64) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/124.0.0.0 Safari/537.36"
                )
            },
        )
        response.raise_for_status()

        soup = BeautifulSoup(response.text, "html.parser")

        body = soup.body
        job_html = body.decode_contents() if body else response.text

        if "myworkdayjobs" in job_url:
            workday_section = soup.select_one(".css-141ntgo")
            if workday_section:
                job_html = str(workday_section)

        prompt = f"""
Extract the following details from the HTML of a job posting:
- Job Title
- Company Name
- Location
- Duration of the Position (length)
- Job Description
- Job Posting URL

Here is the HTML:
{job_html}
"""

        ai_response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful assistant that extracts job details from HTML.",
                },
                {"role": "user", "content": prompt},
            ],
            max_tokens=700,
        )

        parsed_response = ai_response.choices[0].message.content or ""

        title_match = re.search(r"Job Title:\s*(.*)", parsed_response)
        company_match = re.search(r"Company Name:\s*(.*)", parsed_response)
        location_match = re.search(r"Location:\s*(.*)", parsed_response)
        length_match = re.search(r"Duration of the Position.*?:\s*(.*)", parsed_response)
        posting_match = re.search(
            r"Job Description:\s*([\s\S]*?)(?=Job Posting URL:|$)",
            parsed_response,
        )

        title = title_match.group(1).strip() if title_match else "Not provided"
        company = company_match.group(1).strip() if company_match else "Not provided"
        location = location_match.group(1).strip() if location_match else "Not provided"
        length = length_match.group(1).strip() if length_match else "Not provided"
        posting = posting_match.group(1).strip() if posting_match else "Not provided"
        url = job_url

        print("Scraped job posting:", {
            "title": title,
            "company": company,
            "location": location,
            "length": length,
            "posting": posting,
            "url": url,
        })

        return {
            "title": title,
            "company": company,
            "location": location,
            "length": length,
            "posting": posting,
            "url": url,
        }

    except Exception as error:
        print("Error scraping job posting:", error)
        return None