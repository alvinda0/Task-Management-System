export type TaskStatus = "pending" | "in-progress" | "done";

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  deadline: string; 
}

export interface TaskPayload {
  title: string;
  description: string | null;
  status: TaskStatus;
  deadline: string;
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

export interface TaskDetailResponse {
  success: boolean;
  message: string;
  data: Task;
}
