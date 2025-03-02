// 用于返回分页结果
export interface PageResponser<T> {
    data: T;
    total: number;
  }