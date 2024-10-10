const generateCoverLetterODT = require('../helpers/templateGen');
const connectDB = require("../config/db");

let pool;
(async () => {
  pool = await connectDB();
})();


const createCoverLetter = async (req, res) => {
    const { id, email, company, content } = req.body;

    try {
        // Generate the ODT file as a buffer
        const odtBuffer = await generateCoverLetterODT(email, company, content);

        // Set the headers for ODT file download
        res.setHeader('Content-Disposition', `attachment; filename=Cover Letter.odt`);
        res.setHeader('Content-Type', 'application/vnd.oasis.opendocument.text');
        
        // Send the buffer directly as the response
        res.status(200).send(odtBuffer);
    } catch (error) {
        console.error('Error generating cover letter ODT:', error);
        res.status(500).json(error);
    }
};

module.exports = {
    createCoverLetter,
};
