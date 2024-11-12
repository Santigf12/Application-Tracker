const OpenAI = require('openai');
require('dotenv').config();
const scrapeJobPosting = require('../helpers/scraper');


const client = new OpenAI({
    organization: process.env.OPENAI_ORG_ID,
    apiKey: process.env.OPENAI_API_KEY,
});

// Your resume information
const resumeInfo = `
Highly motivated 4th-year Software Engineering student with a strong foundation in programming, software development, and system administration. Passionate about solving complex problems and building innovative software solutions. Eager to contribute to a team and advance in a dynamic environment. Seeking a Winter internship opportunity starting in January 2025 to further develop technical skills and gain hands-on experience.

SKILLS
- Programming Languages: Proficient in Python, C/C++, SQL, Java, JavaScript, React.
- Version Control: Experienced with GitHub for source code management and collaboration.
- Containerization: Expertise in Docker for containerizing applications and managing deployments.
- Data Management: Proficient in SQL database design and management.
- System Administration: Skilled in system administration and automation using Ansible.

EDUCATION
Bachelor of Science in Software Engineering
Expected to graduate in April 2026
Schulich School of Engineering, University of Calgary, Calgary, AB

EXPERIENCE
RESEARCH ASSISTANT, I2Sense Laboratory; University of Calgary, September 2023 – Present
- Engineered and administered React Redux applications with Express/Flask back ends, facilitating efficient survey collection and research operations.
- Created multiple cloud-build YAML files for continuous automatic deployment within Google Artifact Registry.
- Containerized web applications using Docker, optimizing deployments for React and Express services.
- Used Google Cloud Secret Manager to ensure proper security practices with code secrets in Docker image builds.
- Designed SQL schema architectures for research data management, emphasizing hierarchical organization and accessibility.
- Automated deployment of web applications using Ansible within Portainer, leveraging Traefik for reverse proxy management and DNS TLS certification.
- Managed a Unix Ubuntu server for Docker web services with Portainer, ensuring robust service availability.
- Collaborated within a research team using Git, leading to efficient project management and clean code practices.

HOST, New Camp, January 2022 - August 2022 | Calgary, AB
- Supported team operations by maintaining effective communication, resulting in improved client satisfaction and team cohesion.

PROJECTS
Job Tracker, October 2022
- Developed an intuitive job tracking application using React Redux, Express, and MySQL to manage my personal job applications.
- Deployed using GitHub Actions to create personalized Docker images saved within GitHub Container Registry.
- Deployed in personal home lab Unraid Server within three different containers, for front-end, back-end, and MySQL.
- Accessed via a personal domain address managed by Traefik reverse proxy with automatic DNS TLS configuration.

Note Taking App, March 2023
- Integrated Google login authentication to ensure secure user access.
- Utilized AWS DynamoDB for scalable and reliable back-end data storage.
- Developed a responsive front-end using React and deployed via Netlify.
`;

const generateCoverLetterContent = async (req, res) => {
    try {

        const { company, jobPosting } = req.body;

        if (!company || !jobPosting) {
            return res.status(400).json({ message: 'Company and job posting details are required' });
        }

        const prompt = `
        You are an assistant that writes cover letters. Using the following job posting details, create a professional cover letter that highlights the candidate's qualifications, skills, and experience. The candidate's resume information is provided below.

        Company Name: ${company}

        Job Posting Information:
        ${jobPosting}

        Resume Information:
        ${resumeInfo}

        Please generate a cover letter for the job posting, focusing on how the candidate's skills and experience match the requirements of the position.
        `;

        const response = await client.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "system", content: "You are an assistant that writes cover letters." }, 
                { role: "user", content: prompt }
            ],
            max_tokens: 2000,
        });

        const coverLetter = response.choices[0].message.content;
        return res.status(200).json(coverLetter);
    } catch (error) {
        console.error('Error generating cover letter:', error);
        return res.status(500).json(error);
    }
}

const scrapePosting = async (req, res) => {
    try {
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({ message: 'URL is required' });
        }

        const response = await scrapeJobPosting(url);

        return res.status(200).json(response);
    } catch (error) {
        console.error('Error scraping job posting:', error);
        return res.status(500).json(error);
    }
}

module.exports = { generateCoverLetterContent, scrapePosting };
