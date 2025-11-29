const Level = require("../models/levelModel");
const { getAll, createOne, getOne, updateOne, deleteOne } = require("./handlerFactory");

exports.getAllLevels = getAll(Level, { path: 'requiredCourses', select: 'name' });
exports.createNewLevel = createOne(Level);

exports.getLevel = getOne(Level,{ path: 'requiredCourses', select: 'name' });
exports.updateLevel = updateOne(Level);
exports.deleteLevel = deleteOne(Level);