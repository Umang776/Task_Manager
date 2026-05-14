import mongoose from 'mongoose';
import { PROJECT_STATUSES } from '../utils/constants.js';

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    status: {
      type: String,
      enum: PROJECT_STATUSES,
      default: 'Active',
    },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

projectSchema.index({ createdBy: 1 });
projectSchema.index({ members: 1 });

export default mongoose.model('Project', projectSchema);
