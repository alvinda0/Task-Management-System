export type TaskStatus = "pending" | "in-progress" | "done";

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  deadline: string | null; // ISO date string e.g. "2025-12-31"
}

export interface TaskPayload {
  title: string;
  description: string | null;
  status: TaskStatus;
  deadline: string | null;
}

export interface GetTasksParams {
  status?: TaskStatus | "all";
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface TaskListResult {
  tasks: Task[];
  meta: PaginationMeta;
}

/** Backend response envelope for task list */
export interface TaskListResponse {
  success: boolean;
  message: string;
  data: Task[];
  metadata?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

/** Backend response envelope for single task */
export interface TaskDetailResponse {
  success: boolean;
  message: string;
  data: Task;
}
