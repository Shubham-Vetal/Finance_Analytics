"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = exports.updateUserById = exports.deleteUserById = exports.getUserById = exports.getUserByEmail = exports.getUsers = exports.UserModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const UserSchema = new mongoose_1.default.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    authentication: {
        password: { type: String, required: true, select: false },
        sessionToken: { type: String, select: false }, // optional if using JWT
    },
});
exports.UserModel = mongoose_1.default.model('User', UserSchema);
// Reuse existing helpers
const getUsers = () => exports.UserModel.find();
exports.getUsers = getUsers;
const getUserByEmail = (email) => exports.UserModel.findOne({ email }).select('+authentication.password');
exports.getUserByEmail = getUserByEmail;
const getUserById = (id) => exports.UserModel.findById(id);
exports.getUserById = getUserById;
const deleteUserById = (id) => exports.UserModel.findByIdAndDelete({ _id: id });
exports.deleteUserById = deleteUserById;
const updateUserById = (id, values) => exports.UserModel.findByIdAndUpdate(id, values);
exports.updateUserById = updateUserById;
// Create user
const createUser = (values) => new exports.UserModel(values).save().then((user) => user.toObject());
exports.createUser = createUser;
//# sourceMappingURL=users.js.map