const express = require("express");
const { getAllStudentGrades, getStudentGradeByGradeID, updateGrade,deleteGrade} = require("../controllers/gradeController");
const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router();

/*
  api/v1/grades
  api/v1/grades/:gradeId
*/ 

router.use(protect);
router.use(restrictTo("instructor","admin", "super admin"));

router.route("/")
  .get(getAllStudentGrades)

router.route("/:gradeId")
  .get(getStudentGradeByGradeID)
  .patch(updateGrade)
  .delete(deleteGrade);

module.exports = router;