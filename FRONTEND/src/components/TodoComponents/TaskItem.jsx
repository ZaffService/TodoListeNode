import { BASE_URL } from '../../config/api';
import { useAuth } from '../../contexte/useAuth';
import HistoryModal from './HistoryModal';
import PermissionModal from './PermissionModal';
import { useState, useRef } from 'react';
import { useTodo } from '../../contexte/useTodo';
import EditTaskModal from './EditTaskModal';
import { Key, History, Edit, Trash2, Upload, Play, Pause, X } from 'lucide-react';

export default function TaskItem({ task }) {
  const [imageError, setImageError] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const { markDone, deleteTask, updateTask, getTaskHistory, grantPermission } = useTodo();
  
  const getImageUrl = (imageName) => {
    if (!imageName) return null;
    
    const cleanUrl = imageName.toString()
      .trim()
      .replace('http:://', 'http://');

    if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
      return cleanUrl;
    }

    return `${BASE_URL}/uploads/${cleanUrl}`;
  };

  const handleImageError = (e) => {
    setImageError(true);
  };

  const isTaskCompleted = task.etat === "Termine";

  const getVoiceUrl = (voiceName) => {
    if (!voiceName) return null;
    const cleanUrl = voiceName.toString().trim().replace('http:://', 'http://');
    if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
      return cleanUrl;
    }
    return `${BASE_URL}/uploads/${cleanUrl}`;
  };

  const playVoice = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const pauseVoice = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const deleteVoice = async () => {
    await updateTask(task.id, { voiceMessage: null });
  };

  return (
    <>
      <div className="task-item">
        <div className="task-content">
          <div className="task-left">
            <input
              type="checkbox"
              checked={isTaskCompleted}
              onChange={() => {
                if (!isTaskCompleted) {
                  markDone(task.id);
                }
              }}
              className="task-checkbox"
              disabled={isTaskCompleted}
            />
            <div>
              <h3 className={`task-title ${isTaskCompleted ? 'task-title-completed' : ''}`}>
                {task.description}
              </h3>
              {task.image && !imageError && (
                <div className="mt-2">
                  <img 
                    src={getImageUrl(task.image)}
                    alt="Tâche" 
                    className="task-image"
                    onError={handleImageError}
                  />
                </div>
              )}
              {task.image && imageError && (
                <div className="mt-2">
                  <div className="task-image flex items-center justify-center bg-gray-100">
                    <span className="text-sm text-gray-400">Image introuvable</span>
                  </div>
                </div>
              )}
              {!task.image && !isTaskCompleted && (
                <div className="mt-2">
                  <input 
                    type="file" 
                    id={`imageUpload-${task.id}`}
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        updateTask(task.id, { image: file });
                      }
                    }}
                  />
                  <button 
                    onClick={() => document.getElementById(`imageUpload-${task.id}`).click()}
                    className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    <Upload size={14} className="mr-1" />
                    Ajouter une image
                  </button>
                </div>
              )}
              {task.voiceMessage && (
                <div className="mt-2">
                  <audio ref={audioRef} src={getVoiceUrl(task.voiceMessage)} onEnded={() => setIsPlaying(false)} onError={() => console.error('Erreur de chargement du message vocal')} />
                  <div className="flex items-center space-x-2">
                    <button onClick={isPlaying ? pauseVoice : playVoice} className="text-blue-600 hover:text-blue-800">
                      {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                    </button>
                    <span className="text-sm text-gray-500">Message vocal</span>
                    <button onClick={deleteVoice} className="text-red-600 hover:text-red-800">
                      <X size={16} />
                    </button>
                  </div>
                </div>
              )}
              <span className="task-date">
                Créée le {new Date(task.createAt).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
              {task.dateDebut && (
                <span className="task-date block text-sm text-gray-600">
                  Début : {new Date(task.dateDebut).toLocaleString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              )}
              {task.dateFin && (
                <span className="task-date block text-sm text-gray-600">
                  Fin : {new Date(task.dateFin).toLocaleString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              )}
            </div>
          </div>

          <div className="task-actions">
            <button
              onClick={() => setIsPermissionModalOpen(true)}
              className="task-action-button task-action-indigo"
              title="Gérer les permissions"
            >
              <Key className="w-5 h-5" />
            </button>

            <button
              onClick={async () => {
                const historyData = await getTaskHistory(task.id);
                console.log('Historique reçu:', historyData);
                setHistory(historyData || []);
                setIsHistoryModalOpen(true);
              }}
              className="task-action-button task-action-purple"
              title="Voir l'historique"
            >
              <History className="w-5 h-5" />
            </button>

            {!isTaskCompleted && (
              <>
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="task-action-button task-action-blue"
                  title="Modifier la tâche"
                >
                  <Edit className="w-5 h-5" />
                </button>
                
                <button
                  onClick={() => {
                    console.log('Tentative de suppression de la tâche:', task.id);
                    deleteTask(task.id);
                  }}
                  className="task-action-button task-action-red"
                  title="Supprimer la tâche"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {isEditModalOpen && !isTaskCompleted && (
        <EditTaskModal
          task={task}
          onClose={() => setIsEditModalOpen(false)}
          onUpdate={async (updatedData) => {
            await updateTask(task.id, updatedData);
            setIsEditModalOpen(false);
          }}
        />
      )}

      {isHistoryModalOpen && (
        <HistoryModal
          history={history}
          onClose={() => setIsHistoryModalOpen(false)}
        />
      )}

      {isPermissionModalOpen && (
        <PermissionModal
          taskId={task.id}
          onClose={() => setIsPermissionModalOpen(false)}
          onGrant={async (userId, permission) => {
            const success = await grantPermission(task.id, userId, permission);
            if (success) {
              setIsPermissionModalOpen(false);
            }
          }}
        />
      )}
    </>
  );
}