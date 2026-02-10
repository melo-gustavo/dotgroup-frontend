import type { CourseType } from "./courseData";

export type Course = {
  id: string | number;
  title: string;
  type: CourseType;
  description?: string;
  image_url?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type FilteredCourse = Course & {
  typeLabel: string;
};

export type CourseTypeFilter = {
  value: CourseType;
  label: string;
  count: number;
};

export type ApiCourse = {
  id?: string | number;
  title?: string;
  name?: string;
  type?: string;
  courseType?: string;
  course?: {
    type?: string;
  };
  description?: string;
  image_url?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateCourseFormData = {
  title: string;
  description: string;
  type: string;
  image?: File;
  removeImage?: boolean;
};

export type ModalState = "closed" | "create" | "view" | "edit" | "delete";
