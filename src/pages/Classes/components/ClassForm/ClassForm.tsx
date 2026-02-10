import type { FormEvent } from "react";
import { useState } from "react";
import { Input } from "../../../../components/Input/Input";
import {
  Select,
  type SelectOption,
} from "../../../../components/Select/Select";
import { Button } from "../../../../components/Button/Button";
import { useFormValidation } from "../../../../lib/validation/useFormValidation";
import { classValidationSchema } from "../../../../lib/validation/schemas";
import type { CreateClassFormData } from "../../types";
import "./form-style.css";

type ClassFormProps = {
  initialData?: Partial<CreateClassFormData> & { id?: string | number };
  onSubmit: (data: CreateClassFormData) => void | Promise<void>;
  isLoading?: boolean;
  teachers?: Array<{ id: number; name: string }>;
  courses?: Array<{ id: number; title: string }>;
};

export function ClassForm({
  initialData,
  onSubmit,
  isLoading = false,
  teachers = [],
  courses = [],
}: ClassFormProps) {
  const [formData, setFormData] = useState<CreateClassFormData>({
    name: initialData?.name ?? "",
    teacherId: initialData?.teacherId ?? 0,
    courseId: initialData?.courseId ?? 0,
    startDate: initialData?.startDate ?? "",
    endDate: initialData?.endDate ?? "",
  });

  const { validate, validateField, getError, errors } =
    useFormValidation<CreateClassFormData>(classValidationSchema);

  const handleFieldChange = async (
    fieldName: keyof CreateClassFormData,
    value: string | number,
  ) => {
    setFormData({ ...formData, [fieldName]: value });
    await validateField(fieldName, value);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const isValid = await validate(formData);
    if (isValid) {
      await onSubmit(formData);
    }
  };

  const teacherOptions: SelectOption[] = teachers.map((teacher) => ({
    value: String(teacher.id),
    label: teacher.name,
  }));

  const courseOptions: SelectOption[] = courses.map((course) => ({
    value: String(course.id),
    label: course.title,
  }));

  const isFormValid = () => {
    const hasErrors = Object.keys(errors).length > 0;
    const requiredFieldsEmpty =
      !formData.name ||
      !formData.teacherId ||
      !formData.courseId ||
      !formData.startDate ||
      !formData.endDate;

    return !hasErrors && !requiredFieldsEmpty;
  };

  return (
    <form className="class-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <Input
          name="name"
          label="Nome da Turma"
          placeholder="Digite o nome da turma"
          value={formData.name}
          onChange={(e) => handleFieldChange("name", e.target.value)}
          hasError={!!getError("name")}
        />
        {getError("name") && (
          <span className="form-error">{getError("name")}</span>
        )}
      </div>

      <div className="form-group">
        <Select
          name="teacherId"
          label="Professor"
          value={String(formData.teacherId)}
          onValueChange={(value) =>
            handleFieldChange("teacherId", Number(value))
          }
          options={teacherOptions}
          placeholder="Selecione um professor"
        />
        {getError("teacherId") && (
          <span className="form-error">{getError("teacherId")}</span>
        )}
      </div>

      <div className="form-group">
        <Select
          name="courseId"
          label="Curso"
          value={String(formData.courseId)}
          onValueChange={(value) =>
            handleFieldChange("courseId", Number(value))
          }
          options={courseOptions}
          placeholder="Selecione um curso"
        />
        {getError("courseId") && (
          <span className="form-error">{getError("courseId")}</span>
        )}
      </div>

      <div className="form-group">
        <Input
          name="startDate"
          label="Data de Início"
          type="date"
          value={formData.startDate}
          onChange={(e) => handleFieldChange("startDate", e.target.value)}
          hasError={!!getError("startDate")}
        />
        {getError("startDate") && (
          <span className="form-error">{getError("startDate")}</span>
        )}
      </div>

      <div className="form-group">
        <Input
          name="endDate"
          label="Data de Término"
          type="date"
          value={formData.endDate}
          onChange={(e) => handleFieldChange("endDate", e.target.value)}
          hasError={!!getError("endDate")}
        />
        {getError("endDate") && (
          <span className="form-error">{getError("endDate")}</span>
        )}
      </div>

      <Button
        type="submit"
        isLoading={isLoading}
        variant="success"
        disabled={!isFormValid()}
      >
        {initialData?.id ? "Atualizar Turma" : "Criar Turma"}
      </Button>
    </form>
  );
}
