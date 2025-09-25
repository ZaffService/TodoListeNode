export const API_URL ="http://localhost:7000/api";
export const BASE_URL ="http://localhost:7000";

export const ENDPOINTS = {
  BASE_URL: BASE_URL,
  AUTH: {
    LOGIN: `${API_URL}/auth/login`,
    REGISTER: `${API_URL}/auth/register`
  },
  TASKS: {
    LIST: `${API_URL}/tasks`,
    CREATE: `${API_URL}/tasks`,
    UPDATE: (id) => `${API_URL}/tasks/${id}`,
    DELETE: (id) => `${API_URL}/tasks/${id}`,
    MARK_DONE: (id) => `${API_URL}/tasks/${id}/markDone`,
    MARK_UNDONE: (id) => `${API_URL}/tasks/${id}/markUndone`,
    HISTORY: (id) => `${API_URL}/tasks/${id}/historique`,
    GRANT_PERMISSION: (id) => `${API_URL}/grantpermission/${id}`,
    REVOKE_PERMISSION: (userId, taskId, permission) => 
      `${API_URL}/grantpermission/${userId}/${taskId}/${permission}`
  }
};
