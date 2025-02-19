// middlewares/multerConfig.js
const multer = require('multer');
const path = require('path');

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'templates/'); // or any folder you prefer
  },
  filename: (req, file, cb) => {
    
    if ( file.originalname === 'Cover_Letter_Template.odt' ) {
      //replace the existing file with the new one
      return cb(null, 'Cover_Letter_Template.odt');
    }

    // read `id` from query params
    const fileId = req.query.id; 
    // if there's a chance `id` might not exist, handle that

    if (!fileId) {
      // fallback or error handling
      return cb(new Error('Missing file ID in query parameters'));
    }
    // build filename: "resume-file-<id>.<extension>"
    const ext = path.extname(file.originalname); 

    if (file.originalname.includes('Resume')) {
      return cb(null, `resume-file-${fileId}${ext}`);
    } else {
      //use the original name of the file without extension
      return cb(null, `${file.originalname.split('.')[0]}-${fileId}${ext}`);
    }
  },
});

// Create Multer instance
const upload = multer({ storage });

module.exports = upload;
