const mysql = require("mysql2");
require("dotenv").config();


//defining the pool variable outside ensures that the pool is only created once
//it is created this way so the function can be used dynamically with await and async
let pool;

const connectDB = async () => {
    try {
      
      pool = mysql.createPool({
        host: process.env.DATABASE_HOST,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE,
        port: process.env.DATABASE_PORT || 3306, // Use the port from .env or default to 3306
        waitForConnections: true,
        connectionLimit: 10, // Adjust this based on your needs
        queueLimit: 0,
      });

      console.log("MySql Connected to Fuentes Database");
    } catch (error) {
      console.error("Failed to fetch secrets:", error);
      process.exit(1);
    }

  // Connect to the database as a pool
  pool.getConnection((err, connection) => {
    if (err) {
      console.log("error with connecting:", err);
      process.exit(1);
    }
    connection.release();
  });

  return pool;
};

module.exports = connectDB;
