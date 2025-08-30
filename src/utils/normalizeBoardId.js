
export function normalizeBoardId(id) {
  if (!id) return '';
  const s = String(id).trim();
  const match = s.match(/[0-9a-fA-F-]{36}/);
  return match ? match[0] : s; 
}
