import type { QueryParams } from "../../lib/api/httpClient";

export type Student = {
  id: number | string;
  name?: string;
  email?: string;
};

export type StudentSearchParams = QueryParams;

export type CreateStudentFormData = {
  name: string;
  email: string;
};

export type StudentModalState =
  | "closed"
  | "create"
  | "view"
  | "edit"
  | "delete"
  | "enrollments";
