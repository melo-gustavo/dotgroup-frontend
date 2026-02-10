import * as yup from "yup";
import { CourseType } from "../../pages/Courses/courseData";

export const courseValidationSchema = yup.object().shape({
  title: yup
    .string()
    .required("Título do curso é obrigatório")
    .min(3, "Título deve ter pelo menos 3 caracteres")
    .max(255, "Título não deve exceder 255 caracteres"),
  description: yup
    .string()
    .required("Descrição é obrigatória")
    .min(10, "Descrição deve ter pelo menos 10 caracteres")
    .max(1000, "Descrição não deve exceder 1000 caracteres"),
  type: yup
    .string()
    .required("Tipo de curso é obrigatório")
    .oneOf(
      Object.values(CourseType),
      `Tipo de curso deve ser um de: ${Object.values(CourseType).join(", ")}`,
    ),
  image_url: yup
    .string()
    .optional()
    .url("URL da imagem deve ser uma URL válida"),
});

export const userValidationSchema = yup.object().shape({
  name: yup
    .string()
    .required("Nome é obrigatório")
    .min(3, "Nome deve ter pelo menos 3 caracteres")
    .max(255, "Nome não deve exceder 255 caracteres"),
  email: yup
    .string()
    .required("Email é obrigatório")
    .email("Email deve ser um endereço de email válido"),
  type: yup
    .string()
    .required("Tipo de usuário é obrigatório")
    .oneOf(
      ["STUDENT", "TEACHER"],
      'Tipo de usuário deve ser "STUDENT" ou "TEACHER"',
    ),
});

export const classValidationSchema = yup.object().shape({
  teacherId: yup
    .number()
    .required("Professor é obrigatório")
    .positive("ID do professor deve ser um número positivo"),
  courseId: yup
    .number()
    .required("Curso é obrigatório")
    .positive("ID do curso deve ser um número positivo"),
  name: yup
    .string()
    .required("Nome da turma é obrigatório")
    .min(3, "Nome da turma deve ter pelo menos 3 caracteres")
    .max(255, "Nome da turma não deve exceder 255 caracteres"),
  startDate: yup
    .string()
    .required("Data de início é obrigatória")
    .test(
      "start-date-valid",
      "Data de início deve ser uma data válida",
      (value) => (value ? !Number.isNaN(new Date(value).getTime()) : false),
    ),
  endDate: yup
    .string()
    .required("Data de término é obrigatória")
    .test(
      "end-date-valid",
      "Data de término deve ser uma data válida",
      (value) => (value ? !Number.isNaN(new Date(value).getTime()) : false),
    )
    .test(
      "end-date-after-start-date",
      "Data de término deve ser após data de início",
      (value, context) => {
        const startDate = context.parent.startDate as string | undefined;
        if (!value || !startDate) return true;

        const parsedStartDate = new Date(startDate).getTime();
        const parsedEndDate = new Date(value).getTime();

        if (Number.isNaN(parsedStartDate) || Number.isNaN(parsedEndDate)) {
          return false;
        }

        return parsedEndDate >= parsedStartDate;
      },
    ),
});

export const enrollmentValidationSchema = yup.object().shape({
  classId: yup
    .number()
    .required("Turma é obrigatória")
    .positive("ID da turma deve ser um número positivo"),
  userId: yup
    .number()
    .required("Usuário é obrigatório")
    .positive("ID do usuário deve ser um número positivo"),
  courseId: yup
    .number()
    .required("Curso é obrigatório")
    .positive("ID do curso deve ser um número positivo"),
});
