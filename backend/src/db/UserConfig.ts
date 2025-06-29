// src/models/UserConfig.ts
import mongoose from 'mongoose';

const UserConfigSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  csvColumns: [{ type: String }], // fields user wants in CSV
  createdAt: { type: Date, default: Date.now }
});

export const UserConfigModel = mongoose.model('UserConfig', UserConfigSchema);
