import api from "@/api/axios";
import type {
  Task,
  TaskPayload,
  TaskListResult,
  GetTasksParams,
  TaskListResponse,
  TaskDetailResponse,
} from "@/types/task.types";

class TaskService {
  async getTasks(params: GetTasksParams = {}): Promise<TaskListResult> {
    const query: Record<string, string | number> = {};
    if (params.status && params.status !== "all") query.status = params.status;
    if (params.page) query.page = params.page;
    if (params.limit) query.limit = params.limit;
    if (params.search?.trim()) query.search = params.search.trim();

    const { data } = await api.get<TaskListResponse>("/tasks", { params: query });

    if (data.success) {
      return {
        tasks: data.data ?? [],
        meta: data.metadata ?? { page: 1, limit: 10, total: data.data?.length ?? 0, total_pages: 1 },
      };
    }
    throw new Error(data.message || "Gagal memuat daftar tugas");
  }

  async createTask(payload: TaskPayload): Promise<Task> {
    const { data } = await api.post<TaskDetailResponse>("/tasks", payload);

    if (data.success && data.data) {
      return data.data;
    }
    throw new Error(data.message || "Gagal membuat tugas");
  }

  async updateTask(id: number, payload: TaskPayload): Promise<Task> {
    const { data } = await api.put<TaskDetailResponse>(`/tasks/${id}`, payload);

    if (data.success && data.data) {
      return data.data;
    }
    throw new Error(data.message || "Gagal memperbarui tugas");
  }

  async deleteTask(id: number): Promise<void> {
    await api.delete(`/tasks/${id}`);
  }
}

export const taskService = new TaskService();
