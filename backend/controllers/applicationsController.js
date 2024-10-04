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
    return res.status(500).json({ success: false, message: "Internal Server Error" });
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
            posting 
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
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const createApplication = async (req, res) => {
  const { title, company, location, length, posting } = req.body;

  try {
    const query = `
        INSERT INTO job_applications (title, company, location, length, posting) 
        VALUES (?, ?, ?, ?, ?);
    `;

    await pool.promise().query(query, [title, company, location, length, posting]);

    return res.status(201).json({ success: true, message: "Application created" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

module.exports = {
    getAllApplications,
    getApplicationbyId,
    createApplication
};