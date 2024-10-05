const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();

const app = express();

console.log(process.env.DATABASE_HOST);

// middleware
app.use(morgan("combined")); // log requests to the console

// urlencoded middleware
// this sets the maximum size of a file that is being uploaded
app.use(express.json({ limit: "5gb" }));
app.use(express.urlencoded({ limit: "5gb", extended: true }));

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "172.16.1.4",
    ],
    credentials: true,
  })
);

app.use("/api/applications", require("./routes/applicationsRoutes")); //working
app.use("/api/pdf", require("./routes/pdfRoutes")); // New route for PDF generation
app.use("/api/tools", require("./routes/toolsRoutes")); // New route for tools


// set up server to listen on specific port
const port = 5000;
app.listen(port, () => console.log(`Server started on port ${port}`));
