import { useState } from 'react';
import { toast } from 'react-hot-toast';

const PermissionModal = ({ taskId, onClose, onGrant }) => {
  const [userId, setUserId] = useState('');
  const [permission, setPermission] = useState('GET');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!userId.trim()) {
      toast.error('L\'ID utilisateur est requis');
      return;
    }

    try {
      await onGrant(parseInt(userId), permission);
      onClose();
    } catch (error) {
      toast.error(error.message || 'Erreur lors de l\'attribution de la permission');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="flex justify-between items-center mb-4">
          <h2 className="modal-title">Accorder des permissions</h2>
          <button
            onClick={onClose}
            className="modal-close p-2 rounded-full"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              ID Utilisateur
            </label>
            <input
              type="number"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="base-input"
              placeholder="Entrez l'ID de l'utilisateur"
              min="1"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">
              Permission
            </label>
            <select
              value={permission}
              onChange={(e) => setPermission(e.target.value)}
              className="base-input"
            >
              <option value="GET">Lecture</option>
              <option value="PATCH">Modification</option>
              <option value="DELETE">Suppression</option>
            </select>
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
              className="modal-submit bg-indigo-600 hover:bg-indigo-700"
            >
              Accorder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PermissionModal;