const express = require("express");
const Admin = require('../models/adminModel');
const {
  getAllAdmins,
  createNewAdmin,
  getAdmin,
  deleteAdmin,
  updateAdmin,
  deActivateAdmin,
  adminLogin,
  getMe,
  updateMe,
  deActivateMe,
} = require("../controllers/adminController");
const {appendDeActiveBody, reqBodylowerCase, preventUnWantedFields, uploadUserImage, resizeUserImage, appendUserEmail, removeUserImage, setDefaultUserImage } = require("../controllers/handlerFactory");
const { protect, updatePassword, forgotPassword, resetPassword, restrictTo } = require("../controllers/authController");

const router = express.Router();

// ===  Authentication Routes  ===
router.post("/login",adminLogin);
router.post("/forgotPassword",forgotPassword(Admin));
router.patch("/resetPassword/:resetToken",resetPassword(Admin));

//  Apply protect middleware for rest of routes
router.use(protect);
router.patch("/updatePassword", updatePassword(Admin));

// =====  Admin  Specific ======
// router.use(restrictTo("admin","super admin"));

// User Routes
router.route("/me")
  .get(getMe)
  .patch(preventUnWantedFields,reqBodylowerCase,uploadUserImage,appendUserEmail,resizeUserImage,updateMe);

router.patch("/me/deactivate",appendDeActiveBody,deActivateMe);

router.patch("/:id/deactivate", appendDeActiveBody, deActivateAdmin)

// ===== Super Admin  Specific ======
router.use(restrictTo("super admin"));

// Main Routes
router.route("/")
  .get(getAllAdmins)
  .post(setDefaultUserImage,uploadUserImage,appendUserEmail,resizeUserImage,createNewAdmin);

router.route("/:id")
  .get(getAdmin)
  .patch(preventUnWantedFields,uploadUserImage,appendUserEmail,resizeUserImage,updateAdmin)
  .delete(removeUserImage,deleteAdmin);

module.exports = router;
