import mongoose from "mongoose";

export const VALID_GRADES = ["Grade 9", "Grade 10", "Grade 11", "Grade 12"] as const;
export type Grade = (typeof VALID_GRADES)[number];

export interface IStudent {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  grade: Grade;
  enrollmentDate: string;
}

const studentSchema = new mongoose.Schema<IStudent>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    grade: { type: String, required: true, enum: VALID_GRADES },
    enrollmentDate: { type: String, required: true },
  },
  { timestamps: true }
);

export const Student = mongoose.model<IStudent>("Student", studentSchema);
