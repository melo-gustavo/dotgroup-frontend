import { useCallback, useState } from "react";
import {
  createOrUpdateRequest,
  deleteRequest,
  getRequest,
} from "../../lib/api/httpClient";
import { addCreatedAtTimestamps } from "../../lib/api/timestamps";
import type {
  Enrollment,
  CreateEnrollmentFormData,
  ApiEnrollment,
} from "./types";

function extractArray(payload: unknown): unknown[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload && typeof payload === "object" && "data" in payload) {
    const data = (payload as { data?: unknown }).data;
    if (Array.isArray(data)) {
      return data;
    }
  }

  return [];
}

function toPositiveNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function normalizeEnrollment(
  raw: ApiEnrollment & { studentEmail?: string },
): Enrollment {
  const classId = raw.classId ?? raw.class_id;
  const userId = raw.userId ?? raw.user_id;
  const courseId = raw.courseId ?? raw.course_id;

  return {
    id: raw.id ?? `enrollment-${Date.now()}`,
    classId: classId ? toPositiveNumber(classId) : undefined,
    userId: userId ? toPositiveNumber(userId) : undefined,
    courseId: courseId ? toPositiveNumber(courseId) : undefined,
    studentName: raw.studentName ?? raw.student?.name ?? "",
    studentEmail: raw.studentEmail ?? raw.student?.email ?? "",
    className: raw.class?.name ?? raw.class?.className ?? "",
    startDate: raw.class?.startDate ?? raw.class?.start_date ?? "",
    endDate: raw.class?.endDate ?? raw.class?.end_date ?? "",
    enrolledAt: raw.enrolledAt,
    status: raw.status ?? "active",
  };
}

export function useEnrollments() {
  const [enrolling, setEnrolling] = useState(false);
  const [enrollmentError, setEnrollmentError] = useState<string | null>(null);

  const createEnrollment = useCallback(
    async (classId: number, data: CreateEnrollmentFormData) => {
      setEnrolling(true);
      setEnrollmentError(null);

      try {
        const response = await createOrUpdateRequest({
          url: "/enrollments",
          method: "POST",
          payload: addCreatedAtTimestamps({
            classId,
            userId: data.userId,
            courseId: data.courseId,
          }),
        });

        if (!response) {
          throw new Error("Sem resposta do servidor");
        }

        return response;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Erro ao matricular aluno";
        setEnrollmentError(errorMessage);
        throw error;
      } finally {
        setEnrolling(false);
      }
    },
    [],
  );

  const deleteEnrollment = useCallback(
    async (enrollmentId: number | string) => {
      setEnrolling(true);
      setEnrollmentError(null);

      try {
        const response = await deleteRequest(`/enrollments/${enrollmentId}`);

        if (!response) {
          throw new Error("Sem resposta do servidor");
        }

        return response;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Erro ao remover matrícula";
        setEnrollmentError(errorMessage);
        throw error;
      } finally {
        setEnrolling(false);
      }
    },
    [],
  );

  const getClassEnrollments = useCallback(async (classId: number) => {
    try {
      const enrollmentsResponse = await getRequest<unknown>(
        `/enrollments?classId=${classId}`,
      );

      const enrollmentsData = extractArray(enrollmentsResponse);

      const enrollmentsWithStudentData = await Promise.all(
        enrollmentsData.map(async (item) => {
          const enrollment = item as ApiEnrollment;
          const userId = enrollment.userId ?? enrollment.user_id;

          if (!enrollment.student && userId) {
            try {
              const studentResponse = await getRequest<unknown>(
                `/users/${userId}`,
              );
              return {
                ...enrollment,
                student: studentResponse as {
                  id?: string | number;
                  name?: string;
                  email?: string;
                },
                classId,
              };
            } catch {
              return {
                ...enrollment,
                classId,
              };
            }
          }

          return {
            ...enrollment,
            classId,
          };
        }),
      );

      const enrollments = enrollmentsWithStudentData.map((item) =>
        normalizeEnrollment(item as ApiEnrollment),
      );

      return enrollments;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao buscar matrículas";
      setEnrollmentError(errorMessage);
      return [];
    }
  }, []);

  const checkDuplicateEnrollment = useCallback(
    async (userId: number, classId: number) => {
      try {
        const enrollmentsResponse = await getRequest<unknown>(
          `/enrollments?userId=${userId}&classId=${classId}`,
        );

        const enrollments = extractArray(enrollmentsResponse);
        return enrollments.length > 0;
      } catch {
        return false;
      }
    },
    [],
  );

  const checkCourseEnrollment = useCallback(
    async (userId: number, courseId: number) => {
      try {
        const enrollmentsResponse = await getRequest<unknown>(
          `/enrollments?userId=${userId}&courseId=${courseId}`,
        );

        const enrollments = extractArray(enrollmentsResponse);
        return enrollments.length > 0;
      } catch {
        return false;
      }
    },
    [],
  );

  const getStudentEnrollments = useCallback(
    async (studentId: string | number) => {
      try {
        const enrollmentsResponse = await getRequest<unknown>(
          `/enrollments?userId=${studentId}`,
        );

        const enrollmentsData = extractArray(enrollmentsResponse);

        const enrollmentsWithClassData = await Promise.all(
          enrollmentsData.map(async (item) => {
            const enrollment = item as ApiEnrollment;
            const classId = enrollment.classId ?? enrollment.class_id;

            if (!enrollment.class && classId) {
              try {
                const classResponse = await getRequest<unknown>(
                  `/classes/${classId}`,
                );
                return {
                  ...enrollment,
                  class: classResponse as {
                    id?: string | number;
                    name?: string;
                    className?: string;
                    startDate?: string;
                    start_date?: string;
                    endDate?: string;
                    end_date?: string;
                  },
                };
              } catch {
                return enrollment;
              }
            }

            return enrollment;
          }),
        );

        const enrollments = enrollmentsWithClassData.map((item) =>
          normalizeEnrollment(item as ApiEnrollment),
        );

        return enrollments;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Erro ao buscar matrículas";
        setEnrollmentError(errorMessage);
        return [];
      }
    },
    [],
  );

  return {
    createEnrollment,
    deleteEnrollment,
    getClassEnrollments,
    getStudentEnrollments,
    checkDuplicateEnrollment,
    checkCourseEnrollment,
    enrolling,
    enrollmentError,
  };
}
