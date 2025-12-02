const express = require("express");
const { getAllEnrollments, getEnrollment, deleteEnrollment } = require("../controllers/enrollmentController");
const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router();

// Authentication
router.use(protect);
// Authorization
router.use(restrictTo("admin","super admin"))

router.route("/")
  .get(getAllEnrollments);

router.route("/:enrollId")
  .get(getEnrollment)
  .delete(deleteEnrollment);

module.exports = router;