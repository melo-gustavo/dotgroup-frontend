import type { CourseType } from "../Courses/courseData";

export const ClassStatus = {
  PLANNED: "PLANNED",
  ACTIVE: "ACTIVE",
  FINISHED: "FINISHED",
} as const;

export type ClassStatus = (typeof ClassStatus)[keyof typeof ClassStatus];

export type ClassItem = {
  id: string;
  className: string;
  schedule: string;
  studentsCount: number;
  teacherName: string;
  courseTitle: string;
  courseType: CourseType;
  courseTypeLabel: string;
  teacherId: number;
  courseId: number;
  startDate: string;
  endDate: string;
  status: ClassStatus;
  statusLabel: string;
};

export type ApiClass = {
  id?: string | number;
  className?: string;
  name?: string;
  title?: string;
  schedule?: string;
  studentsCount?: number;
  studentsTotal?: number;
  teacherId?: string | number;
  teacher_id?: string | number;
  courseId?: string | number;
  course_id?: string | number;
  startDate?: string;
  start_date?: string;
  endDate?: string;
  end_date?: string;
  courseTitle?: string;
  type?: string;
  courseType?: string;
  status?: string;
  teacher?: {
    id?: string | number;
    name?: string;
  };
  course?: {
    id?: string | number;
    title?: string;
    type?: string;
    courseType?: string;
  };
};

export type ApiCourse = {
  id?: string | number;
  title?: string;
  type?: string;
  courseType?: string;
};

export type ApiUser = {
  id?: string | number;
  name?: string;
};

export type Enrollment = {
  id?: string | number;
  classId?: string | number;
  class_id?: string | number;
  userId?: string | number;
  user_id?: string | number;
  courseId?: string | number;
  course_id?: string | number;
  studentName?: string;
  studentEmail?: string;
  enrolledAt?: string;
  status?: string;
  className?: string;
  startDate?: string;
  endDate?: string;
};

export type CreateEnrollmentFormData = {
  userId: number;
  courseId: number;
};

export type ApiEnrollment = {
  id?: string | number;
  classId?: string | number;
  class_id?: string | number;
  userId?: string | number;
  user_id?: string | number;
  courseId?: string | number;
  course_id?: string | number;
  studentName?: string;
  studentEmail?: string;
  student?: {
    id?: string | number;
    name?: string;
    email?: string;
  };
  class?: {
    id?: string | number;
    name?: string;
    className?: string;
    startDate?: string;
    start_date?: string;
    endDate?: string;
    end_date?: string;
  };
  enrolledAt?: string;
  status?: string;
};

export type ClassFormTeacherOption = {
  id: number;
  name: string;
};

export type ClassFormCourseOption = {
  id: number;
  title: string;
};

export type ClassTypeFilter = {
  value: CourseType;
  label: string;
  count: number;
};

export type ClassStatusFilter = {
  value: ClassStatus;
  label: string;
  count: number;
};

export type CreateClassFormData = {
  name: string;
  teacherId: number;
  courseId: number;
  startDate: string;
  endDate: string;
};

export type ClassModalState =
  | "closed"
  | "create"
  | "view"
  | "edit"
  | "delete"
  | "enroll";
