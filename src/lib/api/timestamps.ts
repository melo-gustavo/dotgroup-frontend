/**
 * Adiciona timestamps aos dados de criação
 * Define createdAt e updatedAt com a data/hora atual
 */
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

/**
 * Adiciona timestamp de atualização aos dados
 * Atualiza apenas updatedAt com a data/hora atual
 */
export function addUpdatedAtTimestamp<T extends object>(
  data: T,
): T & { updatedAt: string } {
  const now = new Date().toISOString();
  return {
    ...data,
    updatedAt: now,
  };
}
