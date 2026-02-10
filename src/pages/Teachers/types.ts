import type { QueryParams } from "../../lib/api/httpClient";

export type Teacher = {
  id: number | string;
  name?: string;
  email?: string;
};

export type TeacherSearchParams = QueryParams;

export type CreateTeacherFormData = {
  name: string;
  email: string;
};

export type TeacherModalState =
  | "closed"
  | "create"
  | "view"
  | "edit"
  | "delete";
