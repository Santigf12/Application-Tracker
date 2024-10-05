const express = require("express");
const router = express.Router();

const { getAllApplications,
    getApplicationbyId,
    createApplication,
    updateApplication,
    deleteApplication,
    saveCoverLetter,
    getCoverLetter

} = require("../controllers/applicationsController");

router.route("/").get(getAllApplications).post(createApplication);

router.route("/cover-letter/:id").get(getCoverLetter);

router.route("/:id").get(getApplicationbyId).put(updateApplication).delete(deleteApplication).post(saveCoverLetter);


module.exports = router;
