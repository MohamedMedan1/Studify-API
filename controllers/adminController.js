const Admin = require("../models/adminModel");
const { login, forgotPassword, resetPassword, updatePassword } = require("./authController");
const {
  getAll,
  createOne,
  getOne,
  deleteOne,
  updateOne,
  deActivate,
  getMe,
  deActivateMe,
  updateMe,
} = require("./handlerFactory");

// ===================  USER Actions  ===================
exports.deActivateMe = deActivateMe(Admin);
exports.getMe = getMe(Admin);
exports.updateMe = updateMe(Admin);

// ===================  AUTH Actions  ===================
exports.adminLogin = login(Admin);
exports.adminForgotPassword = forgotPassword(Admin);
exports.adminResetPassword = resetPassword(Admin);
exports.adminUpdatePassword = updatePassword(Admin);

// ===================  CRUD Actions  ===================
exports.getAllAdmins = getAll(Admin);
exports.createNewAdmin = createOne(Admin);
exports.getAdmin = getOne(Admin);
exports.updateAdmin = updateOne(Admin);
exports.deleteAdmin = deleteOne(Admin);

exports.deActivateAdmin = deActivate(Admin);
