import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createOrUpdateRequest,
  createOrUpdateFormDataRequest,
  deleteRequest,
  getRequest,
} from "../../lib/api/httpClient";
import {
  addCreatedAtTimestamps,
  addUpdatedAtTimestamp,
} from "../../lib/api/timestamps";
import {
  CourseType,
  getCourseTypeLabel,
  type CourseType as CourseTypeValue,
} from "./courseData";
import type {
  ApiCourse,
  Course,
  CourseTypeFilter,
  CreateCourseFormData,
  FilteredCourse,
} from "./types";

function normalizeCourseType(type: unknown): CourseTypeValue {
  const normalized = String(type ?? "")
    .toUpperCase()
    .trim();

  const legacyTypeMap: Record<string, CourseTypeValue> = {
    INOVATION: CourseType.INNOVATION,
    TECNOLOGY: CourseType.TECHNOLOGY,
  };

  const mappedLegacyType = legacyTypeMap[normalized];
  if (mappedLegacyType) {
    return mappedLegacyType;
  }

  // Check for exact matches in CourseType enum
  const validTypes = Object.values(CourseType);
  if (validTypes.includes(normalized as CourseTypeValue)) {
    return normalized as CourseTypeValue;
  }

  // If we have a normalized string that doesn't match, log it for debugging
  if (normalized) {
    console.warn(
      `Unknown course type received: "${normalized}". Defaulting to TECHNOLOGY.`,
    );
  }

  return CourseType.TECHNOLOGY;
}

function normalizeCourse(raw: ApiCourse, index: number): Course {
  const courseType = normalizeCourseType(
    raw.type ?? raw.courseType ?? raw.course?.type,
  );

  // Debug log to see what types are coming from the backend
  if (!raw.type && !raw.courseType) {
    console.log(`Course "${raw.title}" has no type field. Raw data:`, raw);
  }

  return {
    id: raw.id ?? `course-${index + 1}`,
    title: raw.title ?? raw.name ?? `Course ${index + 1}`,
    type: courseType,
    description: raw.description,
    image_url: raw.image_url,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

function extractCoursesPayload(payload: unknown): ApiCourse[] {
  if (Array.isArray(payload)) {
    return payload as ApiCourse[];
  }

  if (payload && typeof payload === "object" && "data" in payload) {
    const data = (payload as { data?: unknown }).data;
    if (Array.isArray(data)) {
      return data as ApiCourse[];
    }
  }

  return [];
}

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [coursesError, setCoursesError] = useState<string | null>(null);
  const [titleFilter, setTitleFilter] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<CourseTypeValue[]>([]);

  const loadCourses = useCallback(async () => {
    setLoadingCourses(true);
    setCoursesError(null);

    try {
      const response = await getRequest<unknown>("/courses");
      const normalizedCourses = extractCoursesPayload(response).map(
        (course, index) => normalizeCourse(course, index),
      );
      setCourses(normalizedCourses);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load courses";
      setCoursesError(message);
    } finally {
      setLoadingCourses(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    if (active) {
      void loadCourses();
    }

    return () => {
      active = false;
    };
  }, [loadCourses]);

  const createCourse = useCallback(
    async (data: CreateCourseFormData) => {
      const coursePayload = {
        title: data.title,
        description: data.description,
        type: data.type,
      };

      if (data.image) {
        const timestamps = addCreatedAtTimestamps(coursePayload);

        const formData = new FormData();
        formData.append("title", data.title);
        formData.append("description", data.description);
        formData.append("type", data.type);
        formData.append("createdAt", timestamps.createdAt);
        formData.append("updatedAt", timestamps.updatedAt);
        formData.append("image", data.image);

        const response = await createOrUpdateFormDataRequest<unknown>({
          url: "/courses",
          method: "POST",
          formData,
        });
        void loadCourses();
        return response;
      }

      const response = await createOrUpdateRequest<
        unknown,
        typeof coursePayload & { createdAt: string; updatedAt: string }
      >({
        url: "/courses",
        method: "POST",
        payload: addCreatedAtTimestamps(coursePayload),
      });
      void loadCourses();
      return response;
    },
    [loadCourses],
  );

  const updateCourse = useCallback(
    async (id: string | number, data: CreateCourseFormData) => {
      const coursePayload = {
        title: data.title,
        description: data.description,
        type: data.type,
        removeImage: Boolean(data.removeImage),
      };

      if (data.image) {
        const timestamps = addUpdatedAtTimestamp(coursePayload);

        const formData = new FormData();
        formData.append("title", data.title);
        formData.append("description", data.description);
        formData.append("type", data.type);
        formData.append("updatedAt", timestamps.updatedAt);
        formData.append("removeImage", String(Boolean(data.removeImage)));
        formData.append("image", data.image);

        const response = await createOrUpdateFormDataRequest<unknown>({
          url: `/courses/${id}`,
          method: "PATCH",
          formData,
        });
        void loadCourses();
        return response;
      }

      const response = await createOrUpdateRequest<
        unknown,
        typeof coursePayload & { updatedAt: string }
      >({
        url: `/courses/${id}`,
        method: "PATCH",
        payload: addUpdatedAtTimestamp(coursePayload),
      });
      void loadCourses();
      return response;
    },
    [loadCourses],
  );

  const deleteCourse = useCallback(
    async (id: string | number) => {
      const response = await deleteRequest<unknown>(`/courses/${id}`);
      void loadCourses();
      return response;
    },
    [loadCourses],
  );

  const typeFilters: CourseTypeFilter[] = useMemo(() => {
    return Object.values(CourseType).map((type) => ({
      value: type,
      label: getCourseTypeLabel(type),
      count: courses.filter((course) => course.type === type).length,
    }));
  }, [courses]);

  const filteredCourses: FilteredCourse[] = useMemo(() => {
    const normalizedTitle = titleFilter.trim().toLowerCase();

    return courses
      .filter((course) => {
        const matchesTitle = normalizedTitle
          ? course.title.toLowerCase().includes(normalizedTitle)
          : true;
        const matchesType =
          selectedTypes.length > 0 ? selectedTypes.includes(course.type) : true;

        return matchesTitle && matchesType;
      })
      .map((course) => ({
        ...course,
        typeLabel: getCourseTypeLabel(course.type),
      }));
  }, [courses, selectedTypes, titleFilter]);

  const toggleTypeFilter = (type: CourseTypeValue) => {
    setSelectedTypes((previousTypes) =>
      previousTypes.includes(type)
        ? previousTypes.filter((item) => item !== type)
        : [...previousTypes, type],
    );
  };

  return {
    title: "Gerenciamento de Cursos",
    description:
      "Crie novos cursos, organize módulos e acompanhe o desempenho das turmas.",
    loadingCourses,
    coursesError,
    titleFilter,
    setTitleFilter,
    selectedTypes,
    typeFilters,
    filteredCourses,
    toggleTypeFilter,
    createCourse,
    updateCourse,
    deleteCourse,
    courses,
  };
}
