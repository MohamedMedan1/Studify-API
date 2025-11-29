const express = require("express");
const {
  getAllStudents,
  createNewStudent,
  getStudent,
  updateStudent,
  deleteStudent,
  studentLogin,
  studentForgotPassword,
  studentResetPassword,
  studentUpdatePassword,
  getMe,
  updateMe,
  deActivateMe
} = require("../controllers/studentController");
const enrollmentRouter = require('./enrollmentRoutes');
const gradeRouter = require('./gradeRoutes');
const { reqBodylowerCase, appendDeActiveBody, preventUnWantedFields, resizeUserImage, uploadUserImage, appendUserEmail, removeUserImage } = require("../controllers/handlerFactory");
const { protect,restrictTo } = require("../controllers/authController");

const router = express.Router();

router.use("/:studentId/enrollments/", enrollmentRouter);//api/v1/students/:studentId/enrollments
router.use("/:studentId/grades/", gradeRouter);//api/v1/students/:studentId/grades

// Authentication  Routes
router.post("/login", studentLogin);
router.post("/forgotPassword", studentForgotPassword);
router.patch("/resetPassword/:resetToken", studentResetPassword);

// Check if user log in or not
router.use(protect);
router.patch("/updatePassword",studentUpdatePassword);

// =====  USER Specific =====
router.use(restrictTo("student","admin","super admin"));

// User Routes
router.route("/me")
  .get(getMe)
  .patch(preventUnWantedFields,reqBodylowerCase,updateMe);

router.patch("/me/deactivate",appendDeActiveBody,deActivateMe);

// =====  Admin and Super Admin Specific =====
router.use(restrictTo("admin","super admin"));

// Main Routes
router.route("/")
  .get(getAllStudents)
  .post(uploadUserImage,appendUserEmail,resizeUserImage,createNewStudent);

router.route("/:id")
  .get(getStudent)
  .patch(preventUnWantedFields,uploadUserImage,appendUserEmail,resizeUserImage,updateStudent)
  .delete(removeUserImage,deleteStudent);

module.exports = router;
