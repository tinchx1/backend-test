import { Router, Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { IStudent, Student, VALID_GRADES } from "../models/Student.js";

export const studentsRouter = Router();

function requireDb(_req: Request, res: Response, next: NextFunction) {
  if (mongoose.connection.readyState !== 1) {
    res.status(503).json({
      error: "Database unavailable",
      hint: "Start MongoDB (e.g. mongod or Docker) and ensure MONGODB_URI is correct.",
    });
    return;
  }
  next();
}

function isValidObjectId(id: string) {
  return mongoose.Types.ObjectId.isValid(id);
}

function toStudentResponse(doc: IStudent) {
  return {
    id: doc._id.toString(),
    name: doc.name,
    email: doc.email,
    grade: doc.grade,
    enrollmentDate: doc.enrollmentDate,
  };
}

function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : "Unknown error";
}

studentsRouter.use(requireDb);

studentsRouter.get("/", async (_req: Request, res: Response) => {
  try {
    const students = await Student.find().lean().exec();
    res.json(students.map(toStudentResponse));
  } catch (e) {
    res.status(500).json({ error: errorMessage(e) });
  }
});

studentsRouter.get("/:id", async (req: Request, res: Response) => {
  if (!isValidObjectId(req.params.id)) {
    res.status(400).json({ error: "Invalid student ID" });
    return;
  }
  try {
    const doc = await Student.findById(req.params.id).lean().exec();
    if (!doc) {
      res.status(404).json({ error: "Student not found" });
      return;
    }
    res.json(toStudentResponse(doc));
  } catch (e) {
    res.status(500).json({ error: errorMessage(e) });
  }
});

studentsRouter.post("/", async (req: Request, res: Response) => {
  try {
    const { name, email, grade, enrollmentDate } = req.body;

    if (!name || !email || !grade || !enrollmentDate) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: "Invalid email format" });
      return;
    }

    if (!VALID_GRADES.includes(grade)) {
      res.status(400).json({ error: `Invalid grade. Must be one of: ${VALID_GRADES.join(", ")}` });
      return;
    }

    const student = await Student.create({ name, email, grade, enrollmentDate });
    res.status(201).json(toStudentResponse(student));
  } catch (e) {
    if (e instanceof mongoose.Error.ValidationError) {
      res.status(400).json({ error: e.message });
      return;
    }
    if ((e as Record<string, unknown>).code === 11000) {
      res.status(409).json({ error: "A student with that email already exists" });
      return;
    }
    res.status(500).json({ error: errorMessage(e) });
  }
});

studentsRouter.put("/:id", async (req: Request, res: Response) => {
  if (!isValidObjectId(req.params.id)) {
    res.status(400).json({ error: "Invalid student ID" });
    return;
  }
  try {
    const { name, email, grade, enrollmentDate } = req.body;

    if (email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({ error: "Invalid email format" });
        return;
      }
    }

    if (grade !== undefined && !VALID_GRADES.includes(grade)) {
      res.status(400).json({ error: `Invalid grade. Must be one of: ${VALID_GRADES.join(", ")}` });
      return;
    }

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      {
        ...(name != null && { name }),
        ...(email != null && { email }),
        ...(grade != null && { grade }),
        ...(enrollmentDate != null && { enrollmentDate }),
      },
      { new: true, runValidators: true }
    )
      .lean()
      .exec();

    if (!student) {
      res.status(404).json({ error: "Student not found" });
      return;
    }
    res.json(toStudentResponse(student));
  } catch (e) {
    if (e instanceof mongoose.Error.ValidationError) {
      res.status(400).json({ error: e.message });
      return;
    }
    res.status(500).json({ error: errorMessage(e) });
  }
});

studentsRouter.delete("/:id", async (req: Request, res: Response) => {
  if (!isValidObjectId(req.params.id)) {
    res.status(400).json({ error: "Invalid student ID" });
    return;
  }
  try {
    const result = await Student.findByIdAndDelete(req.params.id).exec();
    if (!result) {
      res.status(404).json({ error: "Student not found" });
      return;
    }
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ error: errorMessage(e) });
  }
});
