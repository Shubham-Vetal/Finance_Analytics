import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  authenticationPassword: { type: String, required: true, select: false },
  authenticationSessionToken: { type: String, select: false },
});

export const UserModel = mongoose.model('User', UserSchema);

// Reuse existing helpers
export const getUsers = () => UserModel.find();
export const getUserByEmail = (email: string) =>
  UserModel.findOne({ email }).select('+authenticationPassword');

export const getUserById = (id: string) => UserModel.findById(id);
export const deleteUserById = (id: string) => UserModel.findByIdAndDelete({ _id: id });
export const updateUserById = (id: string, values: Record<string, any>) =>
  UserModel.findByIdAndUpdate(id, values);

// Create user
export const createUser = (values: Record<string, any>) =>
  new UserModel(values).save().then((user) => user.toObject());
