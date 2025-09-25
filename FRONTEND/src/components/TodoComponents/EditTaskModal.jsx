import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const EditTaskModal = ({ task, onClose, onUpdate }) => {
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (task) {
      setDescription(task.description || '');
    }
  }, [task]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!description.trim()) {
      toast.error('La description est requise');
      return;
    }

    try {
      const success = await onUpdate({ description });
      if (success) {
        onClose();
      }
    } catch (error) {
      toast.error(error.message || 'Erreur lors de la modification de la tâche');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title mb-4">Modifier la tâche</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="modal-textarea"
              placeholder="Description de la tâche"
              rows="3"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="modal-cancel"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="modal-submit bg-blue-600 hover:bg-blue-700"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTaskModal;