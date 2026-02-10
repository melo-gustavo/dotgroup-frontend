import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { Button } from "../../../../components/Button/Button";
import { SearchableSelect } from "../../../../components/SearchableSelect/SearchableSelect";
import { useStudents } from "../../../Students/useStudents";
import { useEnrollments } from "../../useEnrollments";
import type { Student } from "../../../Students/types";
import type { CreateEnrollmentFormData } from "../../types";
import "./enrollment-form-style.css";

type ClassEnrollmentFormProps = {
  classId: number;
  courseId: number;
  startDate: string;
  endDate: string;
  onSubmit: (data: CreateEnrollmentFormData) => void | Promise<void>;
  isLoading?: boolean;
};

export function ClassEnrollmentForm({
  classId,
  courseId,
  startDate,
  endDate,
  onSubmit,
  isLoading = false,
}: ClassEnrollmentFormProps) {
  const { getAllStudents, students } = useStudents();
  const { checkDuplicateEnrollment, checkCourseEnrollment } = useEnrollments();

  const [selectedUserId, setSelectedUserId] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    void getAllStudents({ type: "STUDENT" });
  }, [getAllStudents]);

  const validateEnrollment = async (): Promise<boolean> => {
    const errors: string[] = [];

    if (!selectedUserId) {
      errors.push("Selecione um aluno para matricular");
      setValidationErrors(errors);
      return false;
    }

    const userId = Number(selectedUserId);

    // Validar data de matrícula
    const today = new Date();
    const classStartDate = new Date(startDate);
    const classEndDate = new Date(endDate);

    if (today < classStartDate) {
      errors.push("A matrícula não está disponível - turma ainda não iniciou");
    }

    if (today > classEndDate) {
      errors.push("A matrícula não está disponível - turma encerrada");
    }

    // Validar matrícula duplicada na mesma turma
    const isDuplicateInClass = await checkDuplicateEnrollment(userId, classId);
    if (isDuplicateInClass) {
      errors.push("Este aluno já está matriculado nesta turma");
    }

    // Validar matrícula duplicada no mesmo curso
    const isDuplicateInCourse = await checkCourseEnrollment(userId, courseId);
    if (isDuplicateInCourse) {
      errors.push("Este aluno já está matriculado em outra turma deste curso");
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      return false;
    }

    setValidationErrors([]);
    return true;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const isValid = await validateEnrollment();
    if (isValid) {
      try {
        await onSubmit({
          userId: Number(selectedUserId),
          courseId,
        });
        setSelectedUserId("");
        setFormError(null);
      } catch (error) {
        setFormError(
          error instanceof Error ? error.message : "Erro ao matricular aluno",
        );
      }
    }
  };

  const isFormValid = () => !selectedUserId || validationErrors.length > 0;

  const studentOptions = students.map((student: Student) => ({
    value: String(student.id),
    label: `${student.name} (${student.email})`,
  }));

  return (
    <form className="enrollment-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <SearchableSelect
          name="student"
          label="Selecione o Aluno"
          value={selectedUserId}
          onValueChange={setSelectedUserId}
          options={studentOptions}
          placeholder="Escolha um aluno para matricular"
          searchPlaceholder="Buscar por nome ou email..."
        />
      </div>

      {formError && <span className="form-error">{formError}</span>}

      {validationErrors.length > 0 && (
        <div className="validation-errors">
          {validationErrors.map((error, index) => (
            <span key={index} className="form-error">
              • {error}
            </span>
          ))}
        </div>
      )}

      <Button
        type="submit"
        isLoading={isLoading}
        variant="success"
        disabled={isFormValid()}
      >
        Confirmar Matrícula
      </Button>
    </form>
  );
}
