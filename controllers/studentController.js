const Student = require("../models/studentModel");
const {
  getAll,
  createOne,
  getOne,
  updateOne,
  deleteOne,
  deActivateMe,
  getMe,
  updateMe,
} = require("./handlerFactory");
const { login, forgotPassword, resetPassword, updatePassword} = require("./authController");

// ===================  USER Actions  ===================
exports.deActivateMe = deActivateMe(Student);
exports.getMe = getMe(Student);
exports.updateMe = updateMe(Student);

// ===================  CRUD Actions  ===================
exports.getAllStudents = getAll(Student, {
  path: "completedCourses",
  select: "name",
});
exports.createNewStudent = createOne(Student);

exports.getStudent = getOne(Student);
exports.updateStudent = updateOne(Student);
exports.deleteStudent = deleteOne(Student);

// ===================  Authentication  ===================
exports.studentLogin = login(Student);
exports.studentForgotPassword = forgotPassword(Student);
exports.studentResetPassword = resetPassword(Student);
exports.studentUpdatePassword = updatePassword(Student);
