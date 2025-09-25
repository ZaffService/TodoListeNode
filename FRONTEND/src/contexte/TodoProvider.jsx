import { useState, useEffect, useCallback } from 'react';
import { TodoContext } from './TodoContext';
import { useAuth } from './useAuth';
import { ENDPOINTS } from '../config/api';
import { grantTaskPermission, revokeTaskPermission } from '../services/api.service';
import toast from 'react-hot-toast';

export function TodoProvider({ children }) {
  const [todos, setTodos] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    limit: 3,
    total: 0
  });
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: 'all' });
  const { token, logout } = useAuth();

  const handleTokenExpired = useCallback(() => {
    toast.error('Session expirée, veuillez vous reconnecter.', { id: 'session-expired' });
    logout();
  }, [logout]);

  const getTodos = useCallback(async (page = 1) => {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '3'
      });

      if (filters.status !== 'all') {
        queryParams.append('etat', filters.status);
      }

      if (search && search.trim()) {
        queryParams.append('search', search.trim());
      }

      queryParams.append('sort', 'desc');

      const response = await fetch(`${ENDPOINTS.TASKS.LIST}?${queryParams}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      const responseData = await response.json();

      if (response.ok) {
        const { tasks, page: currentPage, limit, total, totalPage } = responseData.data;
        
        const tasksWithFixedImageUrls = tasks.map(task => ({
          ...task,
          image: task.image ? task.image.replace('http:://', 'http://') : null
        }));
        
        setTodos(tasksWithFixedImageUrls);
        setPagination({
          currentPage,
          totalPages: totalPage,
          limit,
          total
        });
      } else if (response.status === 401) {
        handleTokenExpired();
      } else {
        toast.error('Erreur lors du chargement des tâches');
        console.error('Erreur API:', responseData);
      }
    } catch (error) {
      console.error('Erreur complète:', error);
      if (error.message.includes('jwt')) {
        handleTokenExpired();
      } else {
        toast.error('Erreur de connexion au serveur');
      }
    }
  }, [token, handleTokenExpired, search, filters]);

  
  useEffect(() => {
    if (token) {
      getTodos(pagination.currentPage || 1); 
    }
  }, [token, filters.status, search, getTodos]); 

  const addTodo = async (formData) => {
    try {
      // ===== DÉBUT DEBUG =====
      console.log('🚀 === DÉBUT DEBUG CREATION TACHE ===');
      console.log('📋 Vérification du FormData:');
      
      // Vérification de la description
      const description = formData.get('description');
      console.log('📝 Description:', description);
      
      if (!description || !description.trim()) {
        console.error('❌ Description manquante');
        toast.error('La description est requise');
        return false;
      }

      // Vérification du token
      console.log('🔑 Token présent:', token ? '✅ OUI' : '❌ NON');
      if (!token) {
        console.error('❌ Token manquant');
        toast.error('Vous devez être connecté');
        handleTokenExpired();
        return false;
      }

      // Analyse complète du FormData
      console.log('📦 Contenu du FormData:');
      let hasImage = false;
      let hasVoice = false;
      
      for (let pair of formData.entries()) {
        if (pair[1] instanceof File) {
          console.log(`📄 ${pair[0]}:`, {
            name: pair[1].name,
            size: pair[1].size + ' bytes',
            type: pair[1].type,
            lastModified: new Date(pair[1].lastModified).toLocaleString()
          });
          
          if (pair[0] === 'image') {
            hasImage = true;
            console.log('🖼️ Image détectée:', pair[1].name);
          }
          
          if (pair[0] === 'voiceMessage') {
            hasVoice = true;
            console.log('🎤 Message vocal détecté:', {
              nom: pair[1].name,
              taille: (pair[1].size / 1024).toFixed(2) + ' KB',
              format: pair[1].type
            });
          }
        } else {
          console.log(`📝 ${pair[0]}:`, pair[1]);
        }
      }

      console.log('📊 Résumé des fichiers:');
      console.log('🖼️ Image présente:', hasImage ? '✅ OUI' : '❌ NON');
      console.log('🎤 Vocal présent:', hasVoice ? '✅ OUI' : '❌ NON');

      // Envoi de la requête
      console.log('🌐 Envoi vers:', ENDPOINTS.TASKS.CREATE);
      console.log('🔑 Headers de la requête:');
      console.log('   Authorization: Bearer [TOKEN_MASQUÉ]');
      console.log('   Content-Type: multipart/form-data (automatique)');

      const response = await fetch(ENDPOINTS.TASKS.CREATE, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`
          // Ne pas définir Content-Type pour FormData
        },
        body: formData
      });

      // ===== DEBUG RÉPONSE SERVEUR =====
      console.log('📡 === RÉPONSE DU SERVEUR ===');
      console.log('📊 Status:', response.status);
      console.log('📊 Status Text:', response.statusText);
      console.log('📊 Headers reçus:');
      
      const headers = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
        console.log(`   ${key}: ${value}`);
      });

      // Cloner la réponse pour pouvoir la lire deux fois
      const responseClone = response.clone();
      let responseText = '';
      let responseData = {};

      try {
        responseText = await responseClone.text();
        console.log('📄 Réponse brute:', responseText);
        
        // Essayer de parser en JSON
        try {
          responseData = JSON.parse(responseText);
          console.log('📋 Réponse JSON parsée:', responseData);
        } catch (jsonError) {
          console.log('⚠️ La réponse n\'est pas du JSON valide');
          responseData = { message: responseText };
        }
      } catch (readError) {
        console.error('❌ Erreur lors de la lecture de la réponse:', readError);
      }

      // Analyse du résultat
      if (response.ok) {
        console.log('✅ === SUCCÈS ===');
        console.log('🎉 Tâche créée avec succès!');
        if (hasVoice) {
          console.log('🎤✅ Le message vocal a été traité avec succès!');
        }
        if (hasImage) {
          console.log('🖼️✅ L\'image a été traitée avec succès!');
        }
        
        toast.success('Tâche créée avec succès !', { id: 'task-created' });
        await getTodos(pagination.currentPage);
        console.log('🔄 Liste des tâches rechargée');
        console.log('🏁 === FIN DEBUG SUCCÈS ===');
        return true;
        
      } else {
        console.log('❌ === ERREUR SERVEUR ===');
        console.log('💥 Status d\'erreur:', response.status);
        
        if (response.status === 401) {
          console.log('🔑 Erreur 401: Token expiré ou invalide');
          handleTokenExpired();
          return false;
          
        } else if (response.status === 403) {
          console.log('🚫 Erreur 403: Accès refusé');
          console.log('🔍 Causes possibles:');
          console.log('   - Permissions insuffisantes');
          console.log('   - Token invalide');
          console.log('   - Serveur refuse le type de fichier');
          if (hasVoice) {
            console.log('   - Format audio non supporté:', formData.get('voiceMessage')?.type);
          }
          toast.error('Accès refusé. Vérifiez vos permissions.', { id: 'access-denied' });
          return false;
          
        } else if (response.status === 413) {
          console.log('📏 Erreur 413: Fichier trop volumineux');
          console.log('🔍 Taille totale des fichiers:');
          let totalSize = 0;
          for (let pair of formData.entries()) {
            if (pair[1] instanceof File) {
              totalSize += pair[1].size;
              console.log(`   ${pair[0]}: ${(pair[1].size / 1024).toFixed(2)} KB`);
            }
          }
          console.log(`   Total: ${(totalSize / 1024).toFixed(2)} KB`);
          toast.error('Fichier trop volumineux. Réduisez la taille.', { id: 'file-too-large' });
          return false;
          
        } else if (response.status === 415) {
          console.log('🎵 Erreur 415: Format de média non supporté');
          if (hasVoice) {
            console.log('🎤 Format audio envoyé:', formData.get('voiceMessage')?.type);
            console.log('💡 Essayez un autre format audio');
          }
          toast.error('Format de fichier non supporté.', { id: 'unsupported-media' });
          return false;
          
        } else {
          console.log('🔥 Autre erreur serveur:', response.status);
          console.log('📄 Détails:', responseData);
        }
        
        const errorMsg = responseData.message || responseData.error || `Erreur ${response.status}: ${response.statusText}`;
        console.log('💬 Message d\'erreur final:', errorMsg);
        toast.error(errorMsg, { id: 'task-error' });
        console.log('🏁 === FIN DEBUG ERREUR ===');
        return false;
      }
      
    } catch (error) {
      console.log('💥 === ERREUR CRITIQUE ===');
      console.error('🔥 Erreur complète:', error);
      console.log('📍 Stack trace:', error.stack);
      
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        console.log('🌐 Erreur de réseau: Impossible de contacter le serveur');
        toast.error('Impossible de contacter le serveur. Vérifiez votre connexion.', { id: 'network-error' });
      } else if (error.message.includes('jwt')) {
        console.log('🔑 Erreur JWT détectée');
        handleTokenExpired();
      } else {
        console.log('❓ Erreur inattendue');
        toast.error('Erreur inattendue: ' + error.message, { id: 'unexpected-error' });
      }
      
      console.log('🏁 === FIN DEBUG ERREUR CRITIQUE ===');
      return false;
    }
  };

  const markDone = async (id) => {
    try {
      const response = await fetch(ENDPOINTS.TASKS.MARK_DONE(id), {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setTodos(prev => prev.map(task => 
          task.id === id ? { ...task, etat: "Termine" } : task
        ));
        toast.success('Tâche marquée comme terminée !');
        return true;
      } else {
        const errorData = await response.json();
        console.error('Erreur lors de la mise à jour:', errorData);
        toast.error(errorData.error || 'Impossible de marquer la tâche comme terminée');
        return false;
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur de connexion au serveur');
      return false;
    }
  };

  
  const updateTask = async (id, updatedData) => {
    try {
      const response = await fetch(ENDPOINTS.TASKS.UPDATE(id), {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedData)
      });

      if (response.ok) {
        const updatedTask = await response.json();
        setTodos(prev => prev.map(task => 
          task.id === id ? { ...task, ...updatedData } : task
        ));
        toast.success('Tâche modifiée avec succès !', { id: 'task-updated' });
        return true;
      } else if (response.status === 401) {
        handleTokenExpired();
        return false;
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Erreur lors de la mise à jour de la tâche');
        return false;
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur de connexion au serveur');
      return false;
    }
  };

  const deleteTask = async (id) => {
    try {
      const response = await fetch(ENDPOINTS.TASKS.DELETE(id), {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setTodos(prev => prev.filter(task => task.id !== id));
        toast.success('Tâche supprimée avec succès !', { id: 'task-deleted' });
        return true;
      } else if (response.status === 401) {
        handleTokenExpired();
        return false;
      } else {
        const errorData = await response.json();
        console.error('Erreur de suppression:', errorData);
        toast.error(errorData.error || "Impossible de supprimer la tâche");
        return false;
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur de connexion au serveur');
      return false;
    }
  };

  const getTaskHistory = async (taskId) => {
    try {
      const response = await fetch(ENDPOINTS.TASKS.HISTORY(taskId), {
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération de l\'historique');
      }

      const result = await response.json();
      if (!result.succes) {
        throw new Error(result.message || 'Erreur lors de la récupération de l\'historique');
      }
      return result.data || [];
    } catch (error) {
      toast.error('Erreur lors de la récupération de l\'historique');
      console.error('Erreur:', error);
      return [];
    }
  };

  const grantPermission = async (taskId, userId, permission) => {
    try {
      await grantTaskPermission(taskId, userId, permission);
      toast.success('Permission accordée avec succès !');
      return true;
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error.message || 'Erreur lors de l\'attribution de la permission');
      return false;
    }
  };

  const revokePermission = async (userId, taskId, permission) => {
    try {
      await revokeTaskPermission(userId, taskId, permission);
      toast.success('Permission retirée avec succès !');
      return true;
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error.message || 'Erreur lors de la révocation de la permission');
      return false;
    }
  };

  const changePage = (page) => {
    getTodos(page);
  };

  return (
    <TodoContext.Provider value={{ 
      todos, 
      getTodos, 
      addTodo, 
      markDone, 
      deleteTask,
      updateTask,
      getTaskHistory,
      pagination,
      changePage,
      search,
      setSearch,
      filters,
      setFilters,
      grantPermission,
      revokePermission
    }}>
      {children}
    </TodoContext.Provider>
  );
}