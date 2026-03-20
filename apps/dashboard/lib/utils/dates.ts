export function formatDate(value: string) {
  return new Date(value).toLocaleDateString();
}

export function formatDateTime(value: string) {
  return new Date(value).toLocaleString();
}
