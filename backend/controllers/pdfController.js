const generateCoverLetterODT = require('../helpers/templateGen');
const connectDB = require("../config/db");
const fs = require('fs');
const path = require('path');
const mime = require('mime-types'); // Import mime-types package
const convertFile = require('../helpers/fileConverter');

let pool;
(async () => {
  pool = await connectDB();
})();

const UPLOADS_DIR = path.join(__dirname, '..', 'templates');

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


const uploadResume = async (req, res) => {
    try {
      // Multer attaches file info to req.file
      // If you use memoryStorage, you'd have req.file.buffer
      // If you use diskStorage, you get req.file.path, etc.
      const file = req.file;
      const id = req.query.id;

      if (!id) {
        return res.status(400).json({ message: 'Missing file ID in query parameters' });
      }
      
      if (!file) {
        return res.status(400).json({ message: "No file uploaded." });
      }

      res.status(200).json({
        uid: id,
        name: file.originalname,
        filePath: file.path,
        status: 'done',
        type: file.mimetype
      });
    } catch (error) {
      console.error("Error uploading CV:", error);
      res.status(500).json({ message: "Error uploading CV" });
    }
};

const uploadCoverLetterTemplate = async (req, res) => {
    try {
      const file = req.file;
  
      if (!file) {
        return res.status(400).json({ message: 'No file uploaded.' });
      }
  
      // Respond with whatever file info you want
      res.status(200).json({
        uid: file.originalname,
        name: file.originalname,
        filePath: file.path, 
        status: 'done',
        type: file.mimetype,
      });
    } catch (error) {
      console.error('Error uploading cover letter template:', error);
      res.status(500).json({ message: 'Error uploading cover letter template' });
    }
};

const getCoverLetterTemplate = async (req, res) => {
    try {
      // Read the directory contents
      fs.readdir(UPLOADS_DIR, (err, files) => {
        if (err) {
          console.error('Error reading directory:', err);
          return res.status(500).json({ message: 'Error reading directory' });
        }
  
        // Filter files that start with 'Cover_Letter_Template'
        const coverLetterTemplate = files.filter((file) => file.startsWith('Cover_Letter_Template'));
  
        // Optionally, build a structured response with file paths
        // so the frontend can reference or download them if needed
        const responseData = coverLetterTemplate.map((filename) => ({
          uid: filename,
          name: filename,
          filePath: path.join('templates', filename),
          status: 'done',
          type: mime.lookup(filename) || 'application/octet-stream',
        }));
  
        return res.status(200).json(responseData);
      });
    } catch (error) {
      console.error('Error getting cover letter template:', error);
      res.status(500).json({ message: 'Error getting cover letter template' });
    }
}
  

const getResumeFiles = async (req, res) => {
    try {
      // Read the directory contents
      fs.readdir(UPLOADS_DIR, (err, files) => {
        if (err) {
          console.error('Error reading directory:', err);
          return res.status(500).json({ message: 'Error reading directory' });
        }
  
        // Filter files that start with 'resume-file-'
        const resumeFiles = files.filter((file) => file.startsWith('resume-file-'));
  
        // Optionally, build a structured response with file paths
        // so the frontend can reference or download them if needed
        const responseData = resumeFiles.map((filename) => ({
            //add uid as id which is the numbers after resume-file-
            uid: filename.split("resume-file-")[1].split(".")[0],
            name: 'Santiago Fuentes Resume.odt',
            filePath: path.join('templates', filename),
            status: 'done',
            type: mime.lookup(filename) || 'application/octet-stream',
        }));
  
        return res.status(200).json(responseData);
      });
    } catch (error) {
      console.error('Error getting resume files:', error);
      res.status(500).json({ message: 'Error getting resume files' });
    }
};

const deleteFile = async (req, res) => {
  try {
    // Retrieve the 'id' from query parameters (e.g. /delete-resume?id=123)
    // or from route params (e.g. /delete-resume/123) depending on your route setup
    const { id } = req.query;

    // Basic validation
    if (!id) {
      return res.status(400).json({ message: "Missing 'id' query parameter." });
    }

    // Read the directory and look for a file that includes `resume-file-<id>`
    fs.readdir(UPLOADS_DIR, (err, files) => {
      if (err) {
        console.error('Error reading directory:', err);
        return res.status(500).json({ message: 'Error reading directory' });
      }

      // e.g., "resume-file-1234.odt"
      const fileToDelete = files.find((file) => file.includes(`${id}`));

      if (!fileToDelete) {
        return res.status(404).json({ message: 'File not found.' });
      }

      // Delete the file
      const filePath = path.join(UPLOADS_DIR, fileToDelete);
      fs.unlink(filePath, (unlinkErr) => {
        if (unlinkErr) {
          console.error('Error deleting file:', unlinkErr);
          return res.status(500).json({ message: 'Error deleting file' });
        }

        return res.status(200).json({ message: 'File deleted successfully', id});
      });
    });
  } catch (error) {
    console.error('Error deleting resume file:', error);
    return res.status(500).json({ message: 'Error deleting resume file' });
  }
};


const uploadOtherFiles = async (req, res) => {
    try {
        const file = req.file;
        const id = req.query.id;
    
        if (!file) {
            return res.status(400).json({ message: 'No file uploaded.' });
        }

        if (!id) {
            return res.status(400).json({ message: 'Missing file ID in query parameters' });
        }
  
        // Respond with whatever file info you want
        res.status(200).json({
            uid: id,
            //add name as the original name of the file without extension
            name: file.originalname,
            filePath: file.path, 
            status: 'done',
            type: file.mimetype,
        });
    } catch (error) {
        console.error('Error uploading other file:', error);
        res.status(500).json({ message: 'Error uploading other file' });
    }
}

const getOtherFiles = async (req, res) => {
    try {
        // Read the directory contents
        fs.readdir(UPLOADS_DIR, (err, files) => {
            if (err) {
                console.error('Error reading directory:', err);
                return res.status(500).json({ message: 'Error reading directory' });
            }
    
            // Filter files that start with 'resume-file-'
            const resumeFiles = files.filter((file) => !file.startsWith('resume-file-') && !file.startsWith('Cover_Letter_Template'));
    
            // Optionally, build a structured response with file paths
            // so the frontend can reference or download them if needed
            const responseData = resumeFiles.map((filename) => ({
                uid: filename,
                name: filename,
                filePath: path.join('templates', filename),
                status: 'done',
                type: mime.lookup(filename) || 'application/octet-stream',
            }));
    
            return res.status(200).json(responseData);
        });
    } catch (error) {
        console.error('Error getting other files:', error);
        res.status(500).json({ message: 'Error getting other files' });
    }
}

// functions to get resume, cover letter, and transcript files
const getMergeFiles = async (req, res) => {
    try {
        const { email, company, content, coverletter } = req.body;

        if (typeof coverletter === 'undefined') {
            return res.status(400).json({ message: 'Missing coverLetter flag (0 or 1)' });
        }

        console.log("Searching for Resume and Transcript...");
        const files = fs.readdirSync(UPLOADS_DIR);
        const resumeFile = files.find(file => file.includes('resume') && file.endsWith('.odt'));
        const transcriptFile = files.find(file => file.includes('Transcripts') && file.endsWith('.pdf'));

        if (!resumeFile || !transcriptFile) {
            return res.status(404).json({ message: 'Files not found' });
        }

        const { default: PDFMerger } = await import('pdf-merger-js');
        const merger = new PDFMerger();

        const resumePath = path.join(UPLOADS_DIR, resumeFile);
        const transcriptPath = path.join(UPLOADS_DIR, transcriptFile);

        console.log("Converting Resume to PDF...");
        const resumePdfPath = await convertFile(resumePath, "pdf");
        await merger.add(resumePdfPath);

        let coverLetterPdfPath = null;

        // Only Generate Cover Letter if `coverLetter = 1`
        if (coverletter == 1) {
            if (!email || !company || !content) {
                return res.status(400).json({ message: 'Missing required fields for cover letter generation' });
            }

            console.log("Generating Cover Letter ODT...");
            const odtBuffer = await generateCoverLetterODT(email, company, content);

            // Save ODT buffer to a temporary file
            const coverLetterOdtPath = path.join(UPLOADS_DIR, `cover-letter-${Date.now()}.odt`);
            fs.writeFileSync(coverLetterOdtPath, odtBuffer);

            console.log("🔄 Converting Cover Letter to PDF...");
            coverLetterPdfPath = await convertFile(coverLetterOdtPath, "pdf");

            await merger.add(coverLetterPdfPath);
        }

        console.log("Adding Transcript PDF...");
        await merger.add(transcriptPath);

        const mergedPdfPath = path.join(UPLOADS_DIR, `merged-${Date.now()}.pdf`);
        await merger.save(mergedPdfPath);

        console.log(`Merged PDF saved: ${mergedPdfPath}`);

        // Send the merged PDF as a response
        res.download(mergedPdfPath, "merged.pdf", (err) => {
            if (err) console.error("Error sending merged PDF:", err);

            // Cleanup: Delete temporary files
            fs.unlinkSync(resumePdfPath);
            fs.unlinkSync(mergedPdfPath);
            if (coverLetterPdfPath) fs.unlinkSync(coverLetterPdfPath); // Only delete if it was created
        });

    } catch (error) {
        console.error("Error merging files:", error);
        res.status(500).json({ message: "Error merging files" });
    }
};

module.exports = {
    createCoverLetter,
    uploadResume,
    getResumeFiles,
    deleteFile,
    uploadCoverLetterTemplate,
    getCoverLetterTemplate,
    uploadOtherFiles,
    getOtherFiles,
    getMergeFiles
};
