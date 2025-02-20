const connectDB = require("../config/db");

let pool;
(async () => {
  pool = await connectDB();
})();

//Description: Get All Groups
//Route: GET /api/groups
const getAllApplications = async (req, res) => {

  try {

    const query = `
        SELECT 
            id, 
            title, 
            company, 
            location, 
            length, 
            CAST(added AS CHAR) AS added, 
            CAST(applied AS CHAR) AS applied, 
            status, 
            posting 
        FROM job_applications;
    `;



    const [result] = await pool.promise().query(query);

    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json(error);
  }
};

const getApplicationbyId = async (req, res) => {
  const { id } = req.params;

  try {
    const query = `
        SELECT 
            id, 
            title, 
            company, 
            location, 
            url,
            length, 
            CAST(added AS CHAR) AS added,
            CAST(applied AS CHAR) AS applied,
            status, 
            posting,
            coverletter
        FROM job_applications
        WHERE id = ?;
    `;

    const [result] = await pool.promise().query(query, [id]);

    if (result.length === 0) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    return res.status(200).json(result[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json(error);
  }
};

const createApplication = async (req, res) => {
  const { title, company, location, length, url, posting, status } = req.body;

  try {
    const query = `
        INSERT INTO job_applications (title, company, location, length, url, posting, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?);
    `;

    await pool.promise().query(query, [title, company, location, length, url, posting, status]);

    return res.status(201).json({ success: true, message: "Application created" });
  } catch (error) {
    console.error(error);
    return res.status(500).json(error);
  }
};

const updateApplication = async (req, res) => {
  const { id } = req.params;
  const { title, company, location, length, url, posting, status, applied, added } = req.body;

  try {
    const query = `
        UPDATE job_applications 
        SET title = ?, company = ?, location = ?, length = ?, url = ?, posting = ?, status = ?,
        applied = ?, added = ?
        WHERE id = ?;
    `;

    await pool.promise().query(query, [title, company, location, length, url, posting, status, applied, added, id]);

    //return status 200 with the updated application
    return res.status(200).json({ title, company, location, length, url, posting, status, applied, added });
  } catch (error) {
    console.error(error);
    return res.status(500).json(error);
  }
}

const deleteApplication = async (req, res) => {
  const { id } = req.params;

  try {
    const query = `
        DELETE FROM job_applications
        WHERE id = ?;
    `;

    await pool.promise().query(query, [id]);

    return res.status(200).json({ success: true, message: "Application deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json(error);
  }
}

const saveCoverLetter = async (req, res) => {
  const { content } = req.body;
  const { id } = req.params;

  if (!content) {
    return res.status(400).json({ success: false, message: "Content cannot be empty" });
  }

  try {
    // Save the cover letter copy to the database
    const query = `INSERT INTO cover_letters (id, content) VALUES (?, ?) ON DUPLICATE KEY UPDATE content = VALUES(content)`;
    await pool.promise().query(query, [id, content]);

    // Update the cover letter flag in job_applications
    const query2 = `UPDATE job_applications SET coverletter = 1 WHERE id = ?`;
    await pool.promise().query(query2, [id]);

    return res.status(200).json({ success: true, message: "Cover letter saved" });
  } catch (error) {
    console.error(error);
    return res.status(500).json(error);
  }
};

const getCoverLetter = async (req, res) => {
  const { id } = req.params;

  try {
    const query = `SELECT content FROM cover_letters WHERE id = ?`;
    const [result] = await pool.promise().query(query, [id]);

    if (result.length === 0) {
      return res.status(200).json("");
    }

    return res.status(200).json(result[0].content);
  } catch (error) {
    console.error(error);
    return res.status(500).json(error);
  }
};


module.exports = {
    getAllApplications,
    getApplicationbyId,
    createApplication,
    updateApplication,
    deleteApplication,
    saveCoverLetter,
    getCoverLetter
};