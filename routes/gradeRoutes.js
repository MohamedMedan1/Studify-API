const express = require("express");
const {
  createNewGrade,
  getAllStudentGrades,
  getStudentGradeByCourseID,
  getStudentGradeByGradeID,
  updateGrade,
  isEnrolledCourse,
} = require("../controllers/gradeController");
const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router({ mergeParams: true });

// Check if user logged in ot not (Authentication)
router.use(protect);

router.route("/getGradeByCourseId/:courseId").get(getStudentGradeByCourseID);

// Check id user authorized to perfrom this action or not
router.use(restrictTo("instructor","admin","super admin"))

router.route("/")
  .get(getAllStudentGrades)
  .post(isEnrolledCourse, createNewGrade);

router.route("/:id")
  .get(getStudentGradeByGradeID)
  .patch(updateGrade);

module.exports = router;
