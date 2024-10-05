const express = require("express");
const router = express.Router();

const { generateCoverLetterContent, } = require("../controllers/toolsController");

// Define the POST route for generating the cover letter PDF
router.route('/cover-letter').post(generateCoverLetterContent);

module.exports = router;