const express = require("express");
const router = express.Router();
const upload = require("../config/multerConfig");

const { createCoverLetter, uploadResume, getResumeFiles, deleteFile,
    uploadCoverLetterTemplate, getCoverLetterTemplate, uploadOtherFiles, getOtherFiles, getMergeFiles
 } = require("../controllers/pdfController");

// Define the POST route for generating the cover letter PDF
router.route('/file-cover-letter').post(createCoverLetter);

router.post('/upload-resume', upload.single('resume-file'), uploadResume);
router.get('/resume-files', getResumeFiles);
router.delete('/delete-file', deleteFile);

router.post('/upload-cover-letter-template', upload.single('cover-letter-template'), uploadCoverLetterTemplate);
router.get('/cover-letter-template', getCoverLetterTemplate);

router.post('/upload-other-files', upload.single('other-files'), uploadOtherFiles);
router.get('/other-files', getOtherFiles);

router.post('/merged', getMergeFiles);


module.exports = router;
