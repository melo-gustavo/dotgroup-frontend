export const CourseType = {
  INNOVATION: "INNOVATION",
  TECHNOLOGY: "TECHNOLOGY",
  MARKETING: "MARKETING",
  ENTREPRENEURSHIP: "ENTREPRENEURSHIP",
  AGROBUSINESS: "AGROBUSINESS",
} as const;

export type CourseType = (typeof CourseType)[keyof typeof CourseType];

export function getCourseTypeLabel(type: CourseType): string {
  const labelMap: Record<CourseType, string> = {
    [CourseType.INNOVATION]: "Inovação",
    [CourseType.TECHNOLOGY]: "Tecnologia",
    [CourseType.MARKETING]: "Marketing",
    [CourseType.ENTREPRENEURSHIP]: "Empreendedorismo",
    [CourseType.AGROBUSINESS]: "Agronegócio",
  };

  return labelMap[type];
}
