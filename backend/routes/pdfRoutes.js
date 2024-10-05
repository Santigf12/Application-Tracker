const express = require("express");
const router = express.Router();

const { createCoverLetter, } = require("../controllers/pdfController");

// Define the POST route for generating the cover letter PDF
router.route('/file-cover-letter').post(createCoverLetter);

module.exports = router;
