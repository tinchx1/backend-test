import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Student } from "@/types/student";

interface StudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student?: Student | null;
  onSave: (student: Omit<Student, "id"> & { id?: string }) => void;
}

export const GRADES = ["Grade 9", "Grade 10", "Grade 11", "Grade 12"] as const;

export function StudentDialog({
  open,
  onOpenChange,
  student,
  onSave,
}: StudentDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    grade: "",
    enrollmentDate: "",
  });

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name,
        email: student.email,
        grade: student.grade,
        enrollmentDate: student.enrollmentDate,
      });
    } else {
      setFormData({
        name: "",
        email: "",
        grade: "",
        enrollmentDate: new Date().toISOString().split("T")[0],
      });
    }
  }, [student, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...(student?.id && { id: student.id }),
      ...formData,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {student ? "Edit Student" : "Add New Student"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Enter student name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="student@example.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="grade">Grade</Label>
            <Select
              value={formData.grade}
              onValueChange={(value) =>
                setFormData({ ...formData, grade: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select grade" />
              </SelectTrigger>
              <SelectContent>
                {GRADES.map((grade) => (
                  <SelectItem key={grade} value={grade}>
                    {grade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="enrollmentDate">Enrollment Date</Label>
            <Input
              id="enrollmentDate"
              type="date"
              value={formData.enrollmentDate}
              onChange={(e) =>
                setFormData({ ...formData, enrollmentDate: e.target.value })
              }
              required
            />
          </div>
          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {student ? "Save Changes" : "Add Student"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
