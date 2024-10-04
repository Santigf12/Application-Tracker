const express = require("express");
const router = express.Router();

const { getAllApplications,
    getApplicationbyId,
    createApplication,
    updateApplication,
    deleteApplication

} = require("../controllers/applicationsController");

router.route("/").get(getAllApplications).post(createApplication);

router.route("/:id").get(getApplicationbyId).put(updateApplication).delete(deleteApplication);


module.exports = router;
