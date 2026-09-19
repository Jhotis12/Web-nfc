export function formatDateTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatChipLabel(serialNumber: string): string {
  return serialNumber.trim() ? serialNumber : 'Chip sin serie'
}
