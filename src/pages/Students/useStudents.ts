import { useCallback, useState } from "react";
import {
  createOrUpdateRequest,
  deleteRequest,
  getRequest,
} from "../../lib/api/httpClient";
import {
  addCreatedAtTimestamps,
  addUpdatedAtTimestamp,
} from "../../lib/api/timestamps";
import type {
  CreateStudentFormData,
  Student,
  StudentSearchParams,
} from "./types";

export function useStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [studentsError, setStudentsError] = useState<string | null>(null);

  const loadStudents = useCallback(async () => {
    setLoadingStudents(true);
    setStudentsError(null);

    try {
      const allStudents = await getRequest<Student[]>("/users", {
        type: "STUDENT",
      });
      setStudents(allStudents);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load students";
      setStudentsError(message);
    } finally {
      setLoadingStudents(false);
    }
  }, []);

  const getAllStudents = useCallback(async (params?: StudentSearchParams) => {
    setLoadingStudents(true);
    setStudentsError(null);

    try {
      const allStudents = await getRequest<Student[]>("/users", params);
      setStudents(allStudents);
      return allStudents;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load students";
      setStudentsError(message);
      throw error;
    } finally {
      setLoadingStudents(false);
    }
  }, []);

  const createStudent = useCallback(
    async (data: CreateStudentFormData) => {
      const response = await createOrUpdateRequest<
        unknown,
        CreateStudentFormData & {
          type: "STUDENT";
          createdAt: string;
          updatedAt: string;
        }
      >({
        url: "/users",
        method: "POST",
        payload: addCreatedAtTimestamps({
          ...data,
          type: "STUDENT",
        }),
      });
      await loadStudents();
      return response;
    },
    [loadStudents],
  );

  const updateStudent = useCallback(
    async (id: string | number, data: CreateStudentFormData) => {
      const response = await createOrUpdateRequest<
        unknown,
        CreateStudentFormData & { type: "STUDENT"; updatedAt: string }
      >({
        url: `/users/${id}`,
        method: "PATCH",
        payload: addUpdatedAtTimestamp({
          ...data,
          type: "STUDENT",
        }),
      });
      await loadStudents();
      return response;
    },
    [loadStudents],
  );

  const deleteStudent = useCallback(
    async (id: string | number) => {
      const response = await deleteRequest<unknown>(`/users/${id}`);
      await loadStudents();
      return response;
    },
    [loadStudents],
  );

  return {
    getAllStudents,
    loadStudents,
    createStudent,
    updateStudent,
    deleteStudent,
    students,
    loadingStudents,
    studentsError,
    title: "Gerenciamento de Alunos",
    description:
      "Acompanhe matrículas, presença e progresso acadêmico por curso.",
  };
}
