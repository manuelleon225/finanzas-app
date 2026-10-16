export function hasMorePages(rowsInPage: number, pageSize: number): boolean {
  return rowsInPage >= pageSize;
}

export function nextOffset(offset: number, pageSize: number): number {
  return offset + pageSize;
}
