const express = require("express");
const {
  getAllCourses,
  createNewCourse,
  getCourse,
  updateCourse,
  deleteCourse,
  removeCourseFromRef,
  checkIfLevelExist,
} = require("../controllers/courseController");
const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router();

router.route("/")
  .get(getAllCourses);

router.route("/:id")
  .get(getCourse);

// Check if user logged in or nor 
router.use(protect);

// Check if user authorized to perform this action or not
router.use(restrictTo("admin", "super admin"));

router.route("/")
  .post(checkIfLevelExist,createNewCourse);

router.route("/:id")
  .patch(checkIfLevelExist,updateCourse)
  .delete(deleteCourse,removeCourseFromRef);

module.exports = router;
