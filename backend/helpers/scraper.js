const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const OpenAI = require('openai');

const client = new OpenAI({
    organization: process.env.OPENAI_ORG_ID,
    apiKey: process.env.OPENAI_API_KEY,
});

const scrapeJobPosting = async (jobUrl) => {
    try {
        // Launch a Puppeteer browser instance
        const browser = await puppeteer.launch({ 
            headless: true,
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium-browser', // Use the system-installed Chromium
            args: ['--no-sandbox', '--disable-setuid-sandbox'] // Disable the sandbox for root execution
        });
        const page = await browser.newPage();
        
        // Go to the job URL
        await page.goto(jobUrl, { waitUntil: 'networkidle0' }); // Wait for the page to fully load

        // Get the full page content
        const data = await page.content();

        // Load the HTML into Cheerio for parsing
        const $ = cheerio.load(data);

        let jobHtml = $('body').html();

        if (jobUrl.includes('myworkdayjobs')) {
            jobHtml = $('.css-141ntgo').html();
        }

        // Close the browser
        await browser.close();

        // Prepare the prompt for ChatGPT API to extract the needed info
        const prompt = `
        Extract the following details from the HTML of a job posting:
        - Job Title
        - Company Name
        - Location
        - Duration of the Position (length)
        - Job Posting URL

        Here is the HTML:
        ${jobHtml}
        `;

        const response = await client.chat.completions.create({
            model: "gpt-3.5-turbo-0125",
            messages: [
                { role: "system", content: "You are a helpful assistant that extracts job details from HTML." },
                { role: "user", content: prompt },
            ],
            max_tokens: 500,
        });

        // Extract and return the result
        const parsedResponse = response.choices[0].message.content;

        // Use regular expressions or string manipulation to extract the values
        const titleMatch = parsedResponse.match(/Job Title:\s*(.*)/);
        const companyMatch = parsedResponse.match(/Company Name:\s*(.*)/);
        const locationMatch = parsedResponse.match(/Location:\s*(.*)/);
        const lengthMatch = parsedResponse.match(/Duration of the Position:\s*(.*)/);
        const postingMatch = parsedResponse.match(/Job Description:\s*([\s\S]*)(?=Job Posting URL)/);  // Capture multi-line job description
        const url = jobUrl;  // Use the provided URL

        // Extract values with fallback in case any field is missing
        const title = titleMatch ? titleMatch[1].trim() : 'Not provided';
        const company = companyMatch ? companyMatch[1].trim() : 'Not provided';
        const location = locationMatch ? locationMatch[1].trim() : 'Not provided';
        const length = lengthMatch ? lengthMatch[1].trim() : 'Not provided';
        const posting = postingMatch ? postingMatch[1].trim() : 'Not provided';

        // Return the result in the required format
        return { title, company, location, length, posting, url };

    } catch (error) {
        console.error('Error scraping job posting:', error);
        return null;
    }
};

module.exports = scrapeJobPosting;
