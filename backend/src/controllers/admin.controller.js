// controllers/admin.controller.js
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

// Get all users
export const getUsers = async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
};

// Get single user
export const getUserById = async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
};

// Create new user
export const createUser = async (req, res) => {
  const { email, fullName, password, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await User.create({ email, fullName, password: hashedPassword, role });
  res.status(201).json(newUser);
};

// Update user
export const updateUser = async (req, res) => {
  const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updatedUser);
};

// Delete user
export const deleteUser = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "User deleted" });
};
