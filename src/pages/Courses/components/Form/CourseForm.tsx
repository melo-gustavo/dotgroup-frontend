import type { FormEvent } from "react";
import { useState } from "react";
import { Input } from "../../../../components/Input/Input";
import { Select } from "../../../../components/Select/Select";
import { FileInput } from "../../../../components/FileInput/FileInput";
import { Button } from "../../../../components/Button/Button";
import { CourseType, getCourseTypeLabel } from "../../courseData";
import type { CreateCourseFormData } from "../../types";
import { useFormValidation } from "../../../../lib/validation/useFormValidation";
import { courseValidationSchema } from "../../../../lib/validation/schemas";
import "./form-style.css";

type CourseFormProps = {
  initialData?:
    | (Partial<CreateCourseFormData> & { id?: string | number; image_url?: string })
    | undefined;
  onSubmit: (data: CreateCourseFormData) => void | Promise<void>;
  isLoading?: boolean;
};

type CourseValidationData = {
  title: string;
  description: string;
  type: string;
};

export function CourseForm({
  initialData,
  onSubmit,
  isLoading = false,
}: CourseFormProps) {
  const initialImageUrl = initialData?.image_url ?? null;
  const [formData, setFormData] = useState<CreateCourseFormData>(() => ({
    title: initialData?.title ?? "",
    description: initialData?.description ?? "",
    type: initialData?.type ?? "",
    removeImage: false,
  }));

  const [previewUrl, setPreviewUrl] = useState<string | null>(
    initialImageUrl,
  );

  const { validate, validateField, getError, errors } =
    useFormValidation<CourseValidationData>(courseValidationSchema);

  const handleFieldChange = async (
    fieldName: keyof CourseValidationData,
    value: string,
  ) => {
    setFormData({ ...formData, [fieldName]: value });
    await validateField(fieldName, value);
  };

  const handleImageChange = (file: File | null) => {
    setFormData({
      ...formData,
      image: file ?? undefined,
      removeImage: file ? false : formData.removeImage,
    });

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleRemoveImage = () => {
    setFormData({
      ...formData,
      image: undefined,
      removeImage: Boolean(initialImageUrl),
    });
    setPreviewUrl(null);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const isValid = await validate({
      title: formData.title,
      description: formData.description,
      type: formData.type,
    });
    if (isValid) {
      await onSubmit(formData);
    }
  };

  const isFormValid = () => {
    const hasErrors = Object.keys(errors).length > 0;
    const requiredFieldsEmpty =
      !formData.title || !formData.description || !formData.type;

    return !hasErrors && !requiredFieldsEmpty;
  };

  return (
    <form className="course-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <Input
          name="title"
          label="Título"
          placeholder="Digite o título do curso"
          value={formData.title}
          onChange={(e) => handleFieldChange("title", e.target.value)}
          hasError={!!getError("title")}
        />
        {getError("title") && (
          <span className="form-error">{getError("title")}</span>
        )}
      </div>

      <div className="form-group">
        <Input
          name="description"
          label="Descrição"
          placeholder="Digite a descrição do curso"
          value={formData.description}
          onChange={(e) => handleFieldChange("description", e.target.value)}
          hasError={!!getError("description")}
        />
        {getError("description") && (
          <span className="form-error">{getError("description")}</span>
        )}
      </div>

      <div className="form-group">
        <Select
          name="type"
          label="Tipo"
          value={formData.type}
          onValueChange={(value) => handleFieldChange("type", value)}
          options={Object.values(CourseType).map((type) => ({
            value: type,
            label: getCourseTypeLabel(type),
          }))}
        />
        {getError("type") && (
          <span className="form-error">{getError("type")}</span>
        )}
      </div>

      <div className="form-group">
        <FileInput
          name="image"
          label="Imagem do Curso (Opcional)"
          accept="image/*"
          onChange={handleImageChange}
          previewUrl={previewUrl}
          previewAlt="Preview da imagem do curso"
        />
        {(previewUrl || formData.image || initialImageUrl) && (
          <Button type="button" variant="secondary" onClick={handleRemoveImage}>
            Remover Imagem
          </Button>
        )}
      </div>

      <Button
        type="submit"
        isLoading={isLoading}
        variant="success"
        disabled={!isFormValid()}
      >
        {initialData?.id ? "Atualizar Curso" : "Criar Curso"}
      </Button>
    </form>
  );
}
