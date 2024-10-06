const express = require("express");
const router = express.Router();

const { generateCoverLetterContent,
        scrapePosting
} = require("../controllers/toolsController");

// Define the POST route for generating the cover letter PDF
router.route('/cover-letter').post(generateCoverLetterContent);

router.route('/scrape-posting').post(scrapePosting);

module.exports = router;