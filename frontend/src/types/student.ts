export interface Student {
  id: string;
  name: string;
  email: string;
  grade: string;
  enrollmentDate: string;
}

export type CreateStudentInput = Omit<Student, "id">;

export type UpdateStudentInput = Partial<CreateStudentInput>;
