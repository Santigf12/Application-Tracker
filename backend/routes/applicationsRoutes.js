const express = require("express");
const router = express.Router();

const { getAllApplications,
    getApplicationbyId,
    createApplication,

} = require("../controllers/applicationsController");

router.route("/").get(getAllApplications).post(createApplication);

router.route("/:id").get(getApplicationbyId);


module.exports = router;
