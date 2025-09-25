const HistoryModal = ({ history, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="modal-title">Historique des modifications</h2>
          <button
            onClick={onClose}
            className="modal-close p-2 rounded-full"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="overflow-y-auto flex-grow">
          {history && history.length > 0 ? (
            <ul className="space-y-4">
              {history.map((entry, index) => (
                <li key={entry.dateModif} className="border-b pb-4 last:border-b-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-gray-600">
                        <span className="font-medium">{entry.action}</span>
                      </p>
                      <span className="text-sm text-gray-500">
                        {entry.dateModif}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      Par {entry.author}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Aucun historique disponible
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="modal-cancel"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;