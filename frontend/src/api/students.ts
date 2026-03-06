import type { Student, CreateStudentInput, UpdateStudentInput } from "@/types/student";

const BASE = "/api/students";

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed (${res.status})`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export async function fetchStudents(): Promise<Student[]> {
  const res = await fetch(BASE);
  return handleResponse<Student[]>(res);
}

export async function fetchStudent(id: string): Promise<Student> {
  const res = await fetch(`${BASE}/${id}`);
  return handleResponse<Student>(res);
}

export async function createStudent(data: CreateStudentInput): Promise<Student> {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<Student>(res);
}

export async function updateStudent(id: string, data: UpdateStudentInput): Promise<Student> {
  const res = await fetch(`${BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<Student>(res);
}

export async function deleteStudent(id: string): Promise<void> {
  const res = await fetch(`${BASE}/${id}`, { method: "DELETE" });
  return handleResponse<void>(res);
}
