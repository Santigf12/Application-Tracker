const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');

// Paths to the ODT template and output directories
const templatePath = path.join(__dirname, '..', 'templates', 'Cover_Letter_Template.odt');
const outputPath = path.join(__dirname, '..', 'output');

// Ensure the output directory exists
if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
}

/**
 * Escapes special XML characters in the text to prevent breaking the XML structure.
 * @param {string} text - The text to escape
 * @returns {string} - The escaped text
 */
const escapeXml = (text) => {
    return text.replace(/[<>&'"]/g, (char) => {
        switch (char) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '"': return '&quot;';
            case "'": return '&apos;';
            default: return char;
        }
    });
}

/**
 * Generates a cover letter ODT using the provided template
 * @param {string} email - The applicant's email
 * @param {string} company - The company name
 * @param {string} content - The cover letter content
 * @returns {Promise<Buffer>} - The generated ODT file as a buffer
 */
const generateCoverLetterODT = async (email, company, content) => {
    try {
        // Read the ODT template
        const templateBytes = fs.readFileSync(templatePath);
        const zip = await JSZip.loadAsync(templateBytes);

        // Get the content.xml file from the ODT
        let contentXml = await zip.file('content.xml').async('string');

        // Escape any special XML characters in the content
        const escapedContent = escapeXml(content);

        // Replace "\n\n" with two line break tags <text:line-break/><text:line-break/>
        // and "\n" with a single line break <text:line-break/>, also trim leading spaces
        const contentWithLineBreaks = escapedContent
            .replace(/\n\s*\n/g, '<text:line-break/><text:line-break/>') // Double newline for two line breaks
            .replace(/\n\s*/g, '<text:line-break/>'); // Single newline for one line break and trim spaces

        // Replace placeholders in the content.xml with the new format
        contentXml = contentXml
            .replace(/##EMAIL##/g, escapeXml(email))
            .replace(/##COMPANY##/g, escapeXml(company))
            .replace(/##CONTENT##/g, contentWithLineBreaks); // Inject content with line breaks

        // Update the content.xml in the zip
        zip.file('content.xml', contentXml);

        // Generate the new ODT file
        // Generate the new ODT file as a buffer
        const odtBuffer = await zip.generateAsync({ type: 'nodebuffer' });

        // Return the ODT file buffer
        return odtBuffer;
    } catch (error) {
        console.error('Error generating cover letter:', error);
        throw new Error('Failed to generate ODT');
    }
};

module.exports = generateCoverLetterODT;