const express = require("express");
const {
  getAllInstructors,
  createNewInstructor,
  getInstructor,
  updateInstructor,
  deleteInstructor,
  deActivateInstructor,
  removeInstructorRef,
  instructorLogin,
  instructorForgotPassword,
  instructorResetPassword,
  instructorUpdatePassword,
  deActivateMe,
  getMe,
  updateMe,
  checkIfCourseExist
} = require("../controllers/instructorController");
const { appendDeActiveBody, reqBodylowerCase, preventUnWantedFields, uploadUserImage, appendUserEmail, resizeUserImage, removeUserImage } = require("../controllers/handlerFactory");
const { protect,restrictTo } = require("../controllers/authController");

const router = express.Router();

// Authentication  Routes
router.post("/login", instructorLogin);
router.post("/forgotPassword", instructorForgotPassword);
router.patch("/resetPassword", instructorResetPassword);

router.route("/")
  .get(getAllInstructors);

router.route("/:id")
  .get(getInstructor)



// Apply Authentication to check if user logged in or not
router.use(protect);
router.post("/updatePassword", instructorUpdatePassword);

// =====  User Specific =====
router.use(restrictTo("instructor","admin", "super admin"));

// User Routes
router.route("/me")
  .get(getMe)
  .patch(preventUnWantedFields,reqBodylowerCase,updateMe);

router.patch("/me/deactivate",appendDeActiveBody,deActivateMe,removeInstructorRef);

// =====  Admin Specific =====
router.use(restrictTo("admin", "super admin"));

// Main Routes
router.route("/:id/deactivate")
  .patch(appendDeActiveBody, deActivateInstructor, removeInstructorRef);
  
// Crud Routes
router.route("/")
  .post(checkIfCourseExist, uploadUserImage,appendUserEmail,resizeUserImage,createNewInstructor);

router
  .route("/:id")
  .patch(preventUnWantedFields,checkIfCourseExist,uploadUserImage,appendUserEmail,resizeUserImage,updateInstructor)
  .delete(removeUserImage,deleteInstructor,removeInstructorRef);

module.exports = router;
