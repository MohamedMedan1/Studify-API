const express = require("express");
const {
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
// Check id user authorized to perfrom this action or not
router.use(restrictTo("student"))

router.route("/getGradeByCourseId/:courseId").get(getStudentGradeByCourseID);

router.route("/")
  .get(getAllStudentGrades)
router.route("/:gradeId")
  .get(getStudentGradeByGradeID);

module.exports = router;
