import type { FormEvent } from "react";
import { useState } from "react";
import { Input } from "../../../../components/Input/Input";
import { Button } from "../../../../components/Button/Button";
import { useFormValidation } from "../../../../lib/validation/useFormValidation";
import { userValidationSchema } from "../../../../lib/validation/schemas";
import type { CreateTeacherFormData } from "../../types";
import "./form-style.css";

type TeacherFormProps = {
  initialData?: Partial<CreateTeacherFormData> & { id?: string | number };
  onSubmit: (data: CreateTeacherFormData) => void | Promise<void>;
  isLoading?: boolean;
};

export function TeacherForm({
  initialData,
  onSubmit,
  isLoading = false,
}: TeacherFormProps) {
  const [formData, setFormData] = useState<CreateTeacherFormData>({
    name: initialData?.name ?? "",
    email: initialData?.email ?? "",
  });

  const { validate, validateField, getError, errors } =
    useFormValidation<CreateTeacherFormData>(
      userValidationSchema.pick(["name", "email"]),
    );

  const handleFieldChange = async (
    fieldName: keyof CreateTeacherFormData,
    value: string,
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

  const isFormValid = () => {
    const hasErrors = Object.keys(errors).length > 0;
    const requiredFieldsEmpty = !formData.name || !formData.email;

    return !hasErrors && !requiredFieldsEmpty;
  };

  return (
    <form className="teacher-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <Input
          name="name"
          label="Nome"
          placeholder="Digite o nome do professor"
          value={formData.name}
          onChange={(e) => handleFieldChange("name", e.target.value)}
          hasError={!!getError("name")}
        />
        {getError("name") && (
          <span className="form-error">{getError("name")}</span>
        )}
      </div>

      <div className="form-group">
        <Input
          name="email"
          label="Email"
          placeholder="Digite o email do professor"
          value={formData.email}
          onChange={(e) => handleFieldChange("email", e.target.value)}
          hasError={!!getError("email")}
        />
        {getError("email") && (
          <span className="form-error">{getError("email")}</span>
        )}
      </div>

      <Button
        type="submit"
        isLoading={isLoading}
        variant="success"
        disabled={!isFormValid()}
      >
        {initialData?.id ? "Atualizar Professor" : "Criar Professor"}
      </Button>
    </form>
  );
}
