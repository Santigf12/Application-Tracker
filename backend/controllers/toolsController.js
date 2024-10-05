const OpenAI = require('openai');
require('dotenv').config();


const client = new OpenAI({
    organization: process.env.OPENAI_ORG_ID,
    apiKey: process.env.OPENAI_API_KEY,
});

// Your resume information
const resumeInfo = `
Highly motivated 4rd-year Software Engineering student with a strong foundation in programming, software development, and system administration. 
Passionate about solving complex problems and building innovative software solutions. 
Eager to contribute to a team and advance in a dynamic, cutting-edge environment. 
Seeking a Winter internship opportunity to further develop technical skills and gain hands-on experience.

Skills:
    - Programming Languages: Proficient in Python, C/C++, SQL, Java, JavaScript, React.
    - Version Control: Experienced with GitHub for source code management and collaboration.
    - Containerization: Expertise in Docker for containerizing applications and managing deployments.
    - Data Management: Proficient in SQL database design and management.
    - System Administration: Skilled in system administration and automation using Ansible.

Education:
    - Bachelor of Science in Software Engineering (Expected to graduate in April 2026)
      Schulich School of Engineering, University of Calgary, Calgary, AB

Experience:
    - RESEARCH ASSISTANT, I2Sense Laboratory; University of Calgary, September 2023 – Present
      - Engineered and administered React Redux applications with Express/Flask back ends.
      - Containerized web applications using Docker.
      - Developed Python-based Google Cloud Functions for container and server communication.
      - Automated deployment of web apps using Ansible and Traefik.
      - Managed a Unix Ubuntu server for Docker services.
    
    - HOST, New Camp, January 2022 - August 2022
      - Supported team operations and improved client satisfaction.

Projects:
    - Museum Gallery (October 2022): Developed an intuitive art gallery app using Python and MySQL.
    - Note Taking App (March 2023): Integrated Google login authentication and utilized AWS DynamoDB for back-end storage.
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
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

module.exports = { generateCoverLetterContent };
