const express = require("express");
const {
  getAllEnrollments,
  createNewEnrollment,
  getEnrollment,
  updateEnrollment,
  deleteEnrollment,
  checkStudentEnrollments,
  checkIfStdCompleteTheCourse,
} = require("../controllers/enrollmentController");
const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router({ mergeParams: true });

// Check if user logged in or nor 
router.use(protect);

// Check if user authorized to perform this action or not
router.use(restrictTo("student","admin","super admin"));

router.route("/")
  .get(getAllEnrollments)
  .post(checkStudentEnrollments, createNewEnrollment);

router.route("/:enrollId")
  .get(getEnrollment)
  .delete(checkIfStdCompleteTheCourse,deleteEnrollment);

// Check if user authorized to perform this action or not
router.use(restrictTo("admin","super admin"));

router.route("/:enrollId")
  .patch(updateEnrollment);
  
module.exports = router;
