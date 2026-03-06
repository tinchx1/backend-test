import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, GraduationCap, Loader2 } from "lucide-react";
import { StudentTable } from "@/components/StudentTable";
import { StudentDialog, GRADES } from "@/components/StudentDialog";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { Student } from "@/types/student";
import { useToast } from "@/hooks/use-toast";
import {
  useStudents,
  useCreateStudent,
  useUpdateStudent,
  useDeleteStudent,
} from "@/hooks/useStudents";
import type { CreateStudentInput } from "@/types/student";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const { toast } = useToast();

  const { data: students = [], isLoading, isError, error } = useStudents();
  const createMutation = useCreateStudent();
  const updateMutation = useUpdateStudent();
  const deleteMutation = useDeleteStudent();

  const filteredStudents = useMemo(() => {
    if (!searchQuery) return students;
    const query = searchQuery.toLowerCase();
    return students.filter(
      (student) =>
        student.name.toLowerCase().includes(query) ||
        student.email.toLowerCase().includes(query) ||
        student.grade.toLowerCase().includes(query)
    );
  }, [students, searchQuery]);

  const handleSave = (data: CreateStudentInput & { id?: string }) => {
    if (data.id) {
      const { id, ...rest } = data;
      updateMutation.mutate(
        { id, data: rest },
        {
          onSuccess: (updated) => {
            toast({
              title: "Student updated",
              description: `${updated.name} has been updated successfully.`,
            });
          },
          onError: (err) => {
            toast({
              title: "Error",
              description: err.message,
              variant: "destructive",
            });
          },
        }
      );
    } else {
      createMutation.mutate(data, {
        onSuccess: (created) => {
          toast({
            title: "Student added",
            description: `${created.name} has been added successfully.`,
          });
        },
        onError: (err) => {
          toast({
            title: "Error",
            description: err.message,
            variant: "destructive",
          });
        },
      });
    }
    setSelectedStudent(null);
  };

  const handleEdit = (student: Student) => {
    setSelectedStudent(student);
    setDialogOpen(true);
  };

  const handleDeleteClick = (student: Student) => {
    setSelectedStudent(student);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!selectedStudent) return;
    deleteMutation.mutate(selectedStudent.id, {
      onSuccess: () => {
        toast({
          title: "Student deleted",
          description: `${selectedStudent.name} has been removed.`,
        });
        setSelectedStudent(null);
      },
      onError: (err) => {
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive",
        });
      },
    });
  };

  const handleAddNew = () => {
    setSelectedStudent(null);
    setDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 text-destructive">
        <p className="text-lg font-semibold">Failed to load students</p>
        <p className="text-sm text-muted-foreground">{(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-5xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              Student Management
            </h1>
          </div>
          <p className="text-muted-foreground">
            Manage your students with ease
          </p>
        </div>

        {/* Actions Bar */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={handleAddNew} className="gap-2 w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            Add Student
          </Button>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">Total Students</p>
            <p className="text-2xl font-bold text-foreground">
              {students.length}
            </p>
          </div>
          {GRADES.map((grade) => (
            <div key={grade} className="rounded-lg border bg-card p-4">
              <p className="text-sm text-muted-foreground">{grade}</p>
              <p className="text-2xl font-bold text-foreground">
                {students.filter((s) => s.grade === grade).length}
              </p>
            </div>
          ))}
        </div>

        {/* Table */}
        <StudentTable
          students={filteredStudents}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
        />

        {/* Dialogs */}
        <StudentDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          student={selectedStudent}
          onSave={handleSave}
        />
        <DeleteConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDeleteConfirm}
          studentName={selectedStudent?.name || ""}
        />
      </div>
    </div>
  );
};

export default Index;
