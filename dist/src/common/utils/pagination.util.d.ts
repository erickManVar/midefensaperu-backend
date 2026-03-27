export interface CursorPaginationResult<T> {
    data: T[];
    nextCursor: string | null;
    hasMore: boolean;
    total?: number;
}
export declare function encodeCursor(id: string): string;
export declare function decodeCursor(cursor: string): string;
