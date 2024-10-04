const generateCoverLetterPDF = require('../helpers/templateGen');

const createCoverLetter = async (req, res) => {
    const { email, company, content } = req.body;

    try {
        const filePath = await generateCoverLetterPDF(email, company, content);
        res.status(200).json({ message: 'PDF generated successfully', filePath });
    } catch (error) {
        res.status(500).json({ message: 'Error generating PDF' });
    }
};

module.exports = {
    createCoverLetter,
}
