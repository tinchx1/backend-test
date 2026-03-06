import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchStudents,
  createStudent,
  updateStudent,
  deleteStudent,
} from "@/api/students";
import type { CreateStudentInput, UpdateStudentInput } from "@/types/student";

const STUDENTS_KEY = ["students"] as const;

export function useStudents() {
  return useQuery({
    queryKey: STUDENTS_KEY,
    queryFn: fetchStudents,
  });
}

export function useCreateStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateStudentInput) => createStudent(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: STUDENTS_KEY }),
  });
}

export function useUpdateStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStudentInput }) =>
      updateStudent(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: STUDENTS_KEY }),
  });
}

export function useDeleteStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteStudent(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: STUDENTS_KEY }),
  });
}
