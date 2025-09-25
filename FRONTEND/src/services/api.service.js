import { API_URL } from '../config/api';

export const grantTaskPermission = async (taskId, userId, permission) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/grantpermission/${taskId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ userId, permission })
    });

    if (!response.ok) {
      throw new Error('Erreur lors de l\'attribution de la permission');
    }

    return await response.json();
  } catch (error) {
    throw new Error(error.message);
  }
};

export const revokeTaskPermission = async (userId, taskId, permission) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/grantpermission/${userId}/${taskId}/${permission}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la révocation de la permission');
    }

    return await response.json();
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getTaskHistory = async (taskId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/tasks/${taskId}/historique`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération de l\'historique');
    }

    return await response.json();
  } catch (error) {
    throw new Error(error.message);
  }
};

export const updateTask = async (taskId, updatedData) => {
  try {
    const token = localStorage.getItem('token');
    let headers = { 'Authorization': `Bearer ${token}` };
    let body;

    if (updatedData instanceof FormData) {
      body = updatedData;
    } else {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(updatedData);
    }

    const response = await fetch(`${API_URL}/tasks/${taskId}`, {
      method: 'PATCH',
      headers,
      body
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la mise à jour de la tâche');
    }

    return await response.json();
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getCompletedTasksCount = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/tasks/count/completed`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération du nombre de tâches terminées');
    }

    const data = await response.json();
    return data.count || 0;
  } catch (error) {
    throw new Error(error.message);
  }
};
