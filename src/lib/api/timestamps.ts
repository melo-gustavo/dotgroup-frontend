export function addCreatedAtTimestamps<T extends object>(
  data: T,
): T & { createdAt: string; updatedAt: string } {
  const now = new Date().toISOString();
  return {
    ...data,
    createdAt: now,
    updatedAt: now,
  };
}

export function addUpdatedAtTimestamp<T extends object>(
  data: T,
): T & { updatedAt: string } {
  const now = new Date().toISOString();
  return {
    ...data,
    updatedAt: now,
  };
}
