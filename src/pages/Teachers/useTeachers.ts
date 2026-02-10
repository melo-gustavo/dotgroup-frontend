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
  CreateTeacherFormData,
  Teacher,
  TeacherSearchParams,
} from "./types";

export function useTeachers() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [teachersError, setTeachersError] = useState<string | null>(null);

  const loadTeachers = useCallback(async () => {
    setLoadingTeachers(true);
    setTeachersError(null);

    try {
      const allTeachers = await getRequest<Teacher[]>("/users", {
        type: "TEACHER",
      });
      setTeachers(allTeachers);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load teachers";
      setTeachersError(message);
    } finally {
      setLoadingTeachers(false);
    }
  }, []);

  const getAllTeachers = useCallback(async (params?: TeacherSearchParams) => {
    setLoadingTeachers(true);
    setTeachersError(null);

    try {
      const allTeachers = await getRequest<Teacher[]>("/users", params);
      setTeachers(allTeachers);
      return allTeachers;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load teachers";
      setTeachersError(message);
      throw error;
    } finally {
      setLoadingTeachers(false);
    }
  }, []);

  const createTeacher = useCallback(
    async (data: CreateTeacherFormData) => {
      const response = await createOrUpdateRequest<
        unknown,
        CreateTeacherFormData & {
          type: "TEACHER";
          createdAt: string;
          updatedAt: string;
        }
      >({
        url: "/users",
        method: "POST",
        payload: addCreatedAtTimestamps({
          ...data,
          type: "TEACHER",
        }),
      });
      await loadTeachers();
      return response;
    },
    [loadTeachers],
  );

  const updateTeacher = useCallback(
    async (id: string | number, data: CreateTeacherFormData) => {
      const response = await createOrUpdateRequest<
        unknown,
        CreateTeacherFormData & { type: "TEACHER"; updatedAt: string }
      >({
        url: `/users/${id}`,
        method: "PATCH",
        payload: addUpdatedAtTimestamp({
          ...data,
          type: "TEACHER",
        }),
      });
      await loadTeachers();
      return response;
    },
    [loadTeachers],
  );

  const deleteTeacher = useCallback(
    async (id: string | number) => {
      const response = await deleteRequest<unknown>(`/users/${id}`);
      await loadTeachers();
      return response;
    },
    [loadTeachers],
  );

  return {
    getAllTeachers,
    loadTeachers,
    createTeacher,
    updateTeacher,
    deleteTeacher,
    teachers,
    loadingTeachers,
    teachersError,
    title: "Gerenciamento de Professores",
    description:
      "Acompanhe professores, dados de contato e pesquise rapidamente sua equipe de ensino.",
  };
}
