import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createOrUpdateRequest,
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
} from "../Courses/courseData";
import type {
  ApiClass,
  ApiCourse,
  ApiUser,
  ClassItem,
  ClassStatus as ClassStatusValue,
  ClassFormCourseOption,
  ClassFormTeacherOption,
  ClassStatusFilter,
  ClassTypeFilter,
  CreateClassFormData,
  Enrollment,
} from "./types";
import { ClassStatus as ClassStatusEnum } from "./types";

function toPositiveNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function normalizeDateInput(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) {
    return "";
  }

  const trimmedValue = value.trim();
  const isoDateMatch = /^\d{4}-\d{2}-\d{2}/.exec(trimmedValue);
  if (isoDateMatch) {
    return isoDateMatch[0];
  }

  const parsedDate = new Date(trimmedValue);
  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return parsedDate.toISOString().slice(0, 10);
}

function formatDateLabel(date: string): string {
  if (!date) return "";
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return parsedDate.toLocaleDateString("pt-BR");
}

function buildSchedule(startDate: string, endDate: string): string {
  const formattedStartDate = formatDateLabel(startDate);
  const formattedEndDate = formatDateLabel(endDate);

  if (formattedStartDate && formattedEndDate) {
    return `${formattedStartDate} - ${formattedEndDate}`;
  }

  if (formattedStartDate) {
    return `Starts on ${formattedStartDate}`;
  }

  if (formattedEndDate) {
    return `Ends on ${formattedEndDate}`;
  }

  return "Schedule not informed";
}

function toDateOnly(value: string): Date | null {
  if (!value) {
    return null;
  }

  const parsedDate = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate;
}

function normalizeClassStatus(
  status: unknown,
  startDate: string,
  endDate: string,
): ClassStatusValue {
  const normalizedStatus = String(status ?? "")
    .toUpperCase()
    .trim();

  const validStatuses = Object.values(ClassStatusEnum);
  if (validStatuses.includes(normalizedStatus as ClassStatusValue)) {
    return normalizedStatus as ClassStatusValue;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const parsedStartDate = toDateOnly(startDate);
  const parsedEndDate = toDateOnly(endDate);

  if (parsedStartDate && parsedStartDate > today) {
    return ClassStatusEnum.PLANNED;
  }

  if (parsedEndDate && parsedEndDate >= today) {
    return ClassStatusEnum.ACTIVE;
  }

  return ClassStatusEnum.FINISHED;
}

function getClassStatusLabel(status: ClassStatusValue): string {
  if (status === ClassStatusEnum.PLANNED) {
    return "Planejada";
  }

  if (status === ClassStatusEnum.ACTIVE) {
    return "Ativa";
  }

  return "Finalizada";
}

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

  const validTypes = Object.values(CourseType);

  if (validTypes.includes(normalized as CourseTypeValue)) {
    return normalized as CourseTypeValue;
  }

  return CourseType.TECHNOLOGY;
}

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

function normalizeClass(raw: ApiClass, index: number): ClassItem {
  const startDate = normalizeDateInput(raw.startDate ?? raw.start_date);
  const endDate = normalizeDateInput(raw.endDate ?? raw.end_date);
  const resolvedStatus = normalizeClassStatus(raw.status, startDate, endDate);

  const resolvedType = normalizeCourseType(
    raw.courseType ?? raw.type ?? raw.course?.courseType ?? raw.course?.type,
  );

  return {
    id: String(raw.id ?? `class-${index + 1}`),
    className: raw.className ?? raw.name ?? raw.title ?? `Class ${index + 1}`,
    schedule: raw.schedule ?? buildSchedule(startDate, endDate),
    studentsCount: raw.studentsCount ?? raw.studentsTotal ?? 0,
    teacherName: raw.teacher?.name ?? "Teacher not informed",
    courseTitle: raw.courseTitle ?? raw.course?.title ?? "Course not informed",
    courseType: resolvedType,
    courseTypeLabel: getCourseTypeLabel(resolvedType),
    teacherId: toPositiveNumber(
      raw.teacherId ?? raw.teacher_id ?? raw.teacher?.id,
    ),
    courseId: toPositiveNumber(raw.courseId ?? raw.course_id ?? raw.course?.id),
    startDate,
    endDate,
    status: resolvedStatus,
    statusLabel: getClassStatusLabel(resolvedStatus),
  };
}

export function useClasses() {
  const [allClasses, setAllClasses] = useState<ClassItem[]>([]);
  const [totalCourses, setTotalCourses] = useState(0);
  const [teachers, setTeachers] = useState<ClassFormTeacherOption[]>([]);
  const [courses, setCourses] = useState<ClassFormCourseOption[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [classesError, setClassesError] = useState<string | null>(null);
  const [titleFilter, setTitleFilter] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<CourseTypeValue[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<ClassStatusValue[]>(
    [],
  );

  const loadClasses = useCallback(async () => {
    setLoadingClasses(true);
    setClassesError(null);

    try {
      const [classesResponse, coursesResponse, teachersResponse] =
        await Promise.all([
          getRequest<unknown>("/classes"),
          getRequest<unknown>("/courses"),
          getRequest<unknown>("/users", { type: "TEACHER" }),
        ]);

      const normalizedClassesWithoutEnrollments = extractArray(
        classesResponse,
      ).map((item, index) => normalizeClass(item as ApiClass, index));
      const coursesPayload = extractArray(coursesResponse) as ApiCourse[];
      const teachersPayload = extractArray(teachersResponse) as ApiUser[];

      const normalizedCourses = coursesPayload
        .map((course, index) => ({
          id: toPositiveNumber(course.id),
          title: course.title ?? `Course ${index + 1}`,
          type: normalizeCourseType(course.type ?? course.courseType),
        }))
        .filter((course) => course.id > 0);

      const courseDetailsById = new Map(
        normalizedCourses.map((course) => [
          course.id,
          { title: course.title, type: course.type },
        ]),
      );

      const classesWithEnrollmentCount = await Promise.all(
        normalizedClassesWithoutEnrollments.map(async (classItem) => {
          const enrollmentsResponse = await getRequest<unknown>(
            "/enrollments",
            {
              classId: classItem.id,
            },
          );
          const enrollments = extractArray(enrollmentsResponse) as Enrollment[];
          const linkedCourse = courseDetailsById.get(classItem.courseId);
          const resolvedCourseType = linkedCourse?.type ?? classItem.courseType;
          const resolvedStatus = normalizeClassStatus(
            classItem.status,
            classItem.startDate,
            classItem.endDate,
          );

          return {
            ...classItem,
            studentsCount: enrollments.length,
            courseTitle:
              classItem.courseTitle !== "Course not informed"
                ? classItem.courseTitle
                : (linkedCourse?.title ??
                  "Course not informed"),
            courseType: resolvedCourseType,
            courseTypeLabel: getCourseTypeLabel(resolvedCourseType),
            schedule:
              classItem.schedule !== "Schedule not informed"
                ? classItem.schedule
                : buildSchedule(classItem.startDate, classItem.endDate),
            status: resolvedStatus,
            statusLabel: getClassStatusLabel(resolvedStatus),
          };
        }),
      );

      const normalizedTeachers = teachersPayload
        .map((teacher, index) => ({
          id: toPositiveNumber(teacher.id),
          name: teacher.name ?? `Teacher ${index + 1}`,
        }))
        .filter((teacher) => teacher.id > 0);

      const teachersById = new Map(
        normalizedTeachers.map((teacher) => [teacher.id, teacher.name]),
      );

      const normalizedClasses = classesWithEnrollmentCount.map((classItem) => ({
        ...classItem,
        teacherName:
          classItem.teacherName !== "Teacher not informed"
            ? classItem.teacherName
            : (teachersById.get(classItem.teacherId) ?? "Teacher not informed"),
      }));

      setAllClasses(normalizedClasses);
      setTotalCourses(coursesPayload.length);
      setCourses(normalizedCourses);
      setTeachers(normalizedTeachers);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load classes";
      setClassesError(message);
    } finally {
      setLoadingClasses(false);
    }
  }, []);

  useEffect(() => {
    void loadClasses();
  }, [loadClasses]);

  const createClass = useCallback(
    async (data: CreateClassFormData) => {
      const status = normalizeClassStatus(
        undefined,
        data.startDate,
        data.endDate,
      );
      const response = await createOrUpdateRequest<
        unknown,
        CreateClassFormData & {
          status: ClassStatusValue;
          createdAt: string;
          updatedAt: string;
        }
      >({
        url: "/classes",
        method: "POST",
        payload: addCreatedAtTimestamps({
          ...data,
          status,
        }),
      });
      await loadClasses();
      return response;
    },
    [loadClasses],
  );

  const updateClass = useCallback(
    async (id: string | number, data: CreateClassFormData) => {
      const status = normalizeClassStatus(
        undefined,
        data.startDate,
        data.endDate,
      );
      const response = await createOrUpdateRequest<
        unknown,
        CreateClassFormData & { status: ClassStatusValue; updatedAt: string }
      >({
        url: `/classes/${id}`,
        method: "PATCH",
        payload: addUpdatedAtTimestamp({
          ...data,
          status,
        }),
      });
      await loadClasses();
      return response;
    },
    [loadClasses],
  );

  const deleteClass = useCallback(
    async (id: string | number) => {
      const response = await deleteRequest<unknown>(`/classes/${id}`);
      await loadClasses();
      return response;
    },
    [loadClasses],
  );

  const typeFilters: ClassTypeFilter[] = useMemo(() => {
    return Object.values(CourseType).map((type) => ({
      value: type,
      label: getCourseTypeLabel(type),
      count: allClasses.filter((classItem) => classItem.courseType === type)
        .length,
    }));
  }, [allClasses]);

  const statusFilters: ClassStatusFilter[] = useMemo(() => {
    return Object.values(ClassStatusEnum).map((status) => ({
      value: status,
      label: getClassStatusLabel(status),
      count: allClasses.filter((classItem) => classItem.status === status).length,
    }));
  }, [allClasses]);

  const filteredClasses = useMemo(() => {
    const normalizedTitle = titleFilter.trim().toLowerCase();

    return allClasses.filter((classItem) => {
      const matchesTitle = normalizedTitle
        ? [
            classItem.className,
            classItem.courseTitle,
            classItem.teacherName,
          ]
            .join(" ")
            .toLowerCase()
            .includes(normalizedTitle)
        : true;
      const matchesType =
        selectedTypes.length > 0
          ? selectedTypes.includes(classItem.courseType)
          : true;
      const matchesStatus =
        selectedStatuses.length > 0
          ? selectedStatuses.includes(classItem.status)
          : true;

      return matchesTitle && matchesType && matchesStatus;
    });
  }, [allClasses, selectedStatuses, selectedTypes, titleFilter]);

  const toggleTypeFilter = (type: CourseTypeValue) => {
    setSelectedTypes((previousTypes) =>
      previousTypes.includes(type)
        ? previousTypes.filter((item) => item !== type)
        : [...previousTypes, type],
    );
  };

  const toggleStatusFilter = (status: ClassStatusValue) => {
    setSelectedStatuses((previousStatuses) =>
      previousStatuses.includes(status)
        ? previousStatuses.filter((item) => item !== status)
        : [...previousStatuses, status],
    );
  };

  return {
    title: "Gerenciamento de Turmas",
    description:
      "Acompanhe todas as turmas geradas a partir de seus cursos e monitore horários e alunos inscritos.",
    loadingClasses,
    classesError,
    classes: filteredClasses,
    totalClasses: filteredClasses.length,
    totalCourses,
    teachers,
    courses,
    titleFilter,
    setTitleFilter,
    selectedTypes,
    selectedStatuses,
    typeFilters,
    statusFilters,
    toggleTypeFilter,
    toggleStatusFilter,
    createClass,
    updateClass,
    deleteClass,
    loadClasses,
  };
}
