// 단일 데이터
export interface StrapiSingleResponse<T> {
    data: T;
    meta?: Record<string, unknown>;
}

// 리스트 데이터
export interface StrapiListResponse<T> {
    data: T[];
    meta: {
        pagination: {
            page: number;
            pageSize: number;
            pageCount: number;
            total: number;
        };
    };
}