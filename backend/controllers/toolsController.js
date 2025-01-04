const OpenAI = require('openai');
require('dotenv').config();
const scrapeJobPosting = require('../helpers/scraper');


const client = new OpenAI({
    organization: process.env.OPENAI_ORG_ID,
    apiKey: process.env.OPENAI_API_KEY,
});

// Your resume information
const resumeInfo = `
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
