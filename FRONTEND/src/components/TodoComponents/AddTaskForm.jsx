import { useState, useRef } from "react";
import { Mic, X, Square, Play, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useTodo } from "../../contexte/useTodo";

export default function AddTaskForm({ onClose }) {
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [apercu, setApercu] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioMimeType, setAudioMimeType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const mediaRecorderRef = useRef(null);
  const timerRef = useRef(null);
  const { addTodo } = useTodo();

  const fermerFormulaire = () => {
    onClose();
  };

  const annulerCreation = () => {
    setDescription("");
    setImage(null);
    setApercu(null);
    setRecordedBlob(null);
    setRecordingTime(0);
    setIsRecording(false);
    setAudioMimeType('');
    setStartDate('');
    setEndDate('');
    if (timerRef.current) clearInterval(timerRef.current);
    onClose();
  };

  const creerTache = async () => {
    if (!description.trim()) {
      toast.error("La description est requise", { id: "description-required" });
      return;
    }

    if (startDate && endDate) {
      const debut = new Date(startDate);
      const fin = new Date(endDate);
      if (debut > fin) {
        toast.error("La date de début doit être antérieure ou égale à la date de fin", { id: "date-validation" });
        return;
      }
    }

    setLoading(true);
    try {
      const descriptionNettoyee = description.trim();

      const formData = new FormData();
      formData.append('description', descriptionNettoyee);
      
      if (image) {
        console.log('Ajout de l\'image:', {
          name: image.name,
          size: image.size,
          type: image.type
        });
        formData.append('image', image);
      }
      
      if (recordedBlob) {
        console.log('Ajout du message vocal:', {
          size: recordedBlob.size,
          type: recordedBlob.type,
          mimeType: audioMimeType
        });
        
        // Déterminer l'extension appropriée
        let extension = '.webm';
        if (audioMimeType.includes('mp4') || audioMimeType.includes('m4a')) {
          extension = '.m4a';
        } else if (audioMimeType.includes('wav')) {
          extension = '.wav';
        } else if (audioMimeType.includes('ogg')) {
          extension = '.ogg';
        }
        
        formData.append('voiceMessage', recordedBlob, `voice${extension}`);
      }

      // Ajout des dates si renseignées (noms adaptés au backend : dateDebut, dateFin)
      if (startDate) {
        formData.append('dateDebut', startDate);
        console.log('Ajout date de début:', startDate);
      }
      if (endDate) {
        formData.append('dateFin', endDate);
        console.log('Ajout date de fin:', endDate);
      }

      // Log du contenu du FormData pour debug
      console.log('Contenu du FormData:');
      for (let pair of formData.entries()) {
        console.log(pair[0] + ':', pair[1]);
      }

      // Vérifier le token avant l'envoi
      const token = localStorage.getItem('token');
      console.log('Token utilisé:', token ? 'Token présent' : 'Aucun token');

      const success = await addTodo(formData);

      if (success) {
        setDescription("");
        setImage(null);
        setApercu(null);
        setRecordedBlob(null);
        setRecordingTime(0);
        setAudioMimeType('');
        setStartDate('');
        setEndDate('');
        onClose?.();
      }
    } catch (error) {
      console.error("Erreur lors de la création:", error);
      toast.error("Erreur lors de la création de la tâche");
    } finally {
      setLoading(false);
    }
  };

  const choisirImage = (e) => {
    const fichier = e.target.files[0];
    if (fichier) {
      // Vérifier la taille du fichier (ex: max 5MB)
      if (fichier.size > 5 * 1024 * 1024) {
        toast.error("L'image ne doit pas dépasser 5MB");
        return;
      }
      
      setImage(fichier);
      setApercu(URL.createObjectURL(fichier));
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        }
      });
      
      // Déterminer le meilleur format supporté
      let options = {};
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        options = { mimeType: 'audio/webm;codecs=opus' };
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        options = { mimeType: 'audio/webm' };
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        options = { mimeType: 'audio/mp4' };
      } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
        options = { mimeType: 'audio/ogg;codecs=opus' };
      } else {
        // Fallback sans spécifier le format
        options = {};
      }
      
      console.log('Format audio utilisé:', options.mimeType || 'format par défaut');
      setAudioMimeType(options.mimeType || 'audio/webm');
      
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      const chunks = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: options.mimeType || 'audio/webm' });
        console.log('Enregistrement terminé:', {
          size: blob.size,
          type: blob.type
        });
        setRecordedBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.onerror = (event) => {
        console.error('Erreur MediaRecorder:', event.error);
        toast.error('Erreur lors de l\'enregistrement');
        stream.getTracks().forEach(track => track.stop());
      };

      // Commencer l'enregistrement avec des données toutes les 100ms
      mediaRecorder.start(100);
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 30) {
            stopRecording();
            return 30;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (error) {
      console.error('Erreur lors de l\'accès au microphone:', error);
      toast.error("Erreur lors de l'accès au microphone: " + error.message);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const deleteRecording = () => {
    setRecordedBlob(null);
    setRecordingTime(0);
    setAudioMimeType('');
  };

  const playRecording = () => {
    if (recordedBlob) {
      const audioUrl = URL.createObjectURL(recordedBlob);
      const audio = new Audio(audioUrl);
      audio.play().catch(error => {
        console.error('Erreur lors de la lecture:', error);
        toast.error('Impossible de lire l\'enregistrement');
      });
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">Nouvelle tâche</h2>
          <button onClick={fermerFormulaire} className="modal-close">
            <X size={20} />
          </button>
        </div>

        <div className="modal-form">
          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="modal-textarea"
              placeholder="Entrez une description"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Image (optionnel)
            </label>

            <div className="space-y-2">
              <input
                type="file"
                id="imageUpload"
                className="hidden"
                accept="image/*"
                onChange={choisirImage}
              />

              <button
                type="button"
                onClick={() => document.getElementById("imageUpload").click()}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Choisir une image
              </button>

              {apercu && (
                <div className="mt-2 relative">
                  <img
                    src={apercu}
                    alt="Aperçu"
                    className="task-image w-full max-h-64 object-cover rounded-md"
                  />
                  <button
                    onClick={() => {
                      setImage(null);
                      setApercu(null);
                      URL.revokeObjectURL(apercu);
                    }}
                    className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-red-50"
                  >
                    <X className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Message vocal (optionnel)
            </label>
            
            {!isRecording && !recordedBlob && (
              <button
                type="button"
                onClick={startRecording}
                className="w-full flex items-center justify-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-md text-blue-600 hover:bg-blue-100 transition-colors"
              >
                <Mic className="w-5 h-5 mr-2" />
                Enregistrer un vocal
              </button>
            )}
            
            {isRecording && (
              <div className="w-full flex items-center justify-center px-4 py-2 bg-red-50 border border-red-200 rounded-md text-red-600">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2 animate-pulse"></div>
                  Enregistrement... {recordingTime}/30s
                </div>
                <button
                  onClick={stopRecording}
                  className="ml-2 p-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  <Square className="w-4 h-4" />
                </button>
              </div>
            )}
            
            {recordedBlob && (
              <div className="w-full flex items-center justify-between px-4 py-2 bg-green-50 border border-green-200 rounded-md text-green-600">
                <div className="flex items-center">
                  <button
                    onClick={playRecording}
                    className="p-1 bg-green-500 text-white rounded mr-2 hover:bg-green-600"
                  >
                    <Play className="w-4 h-4" />
                  </button>
                  <span>Enregistrement terminé ({recordingTime}s)</span>
                </div>
                <button
                  onClick={deleteRecording}
                  className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Section des dates */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-2">
                Date de début (optionnel)
              </label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-2">
                Date de fin (optionnel)
              </label>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button onClick={annulerCreation} className="modal-cancel">
            Annuler
          </button>
          <button
            onClick={creerTache}
            disabled={loading || !description.trim()}
            className="modal-submit"
            style={{ 
              backgroundColor: loading || !description.trim() ? "#9fa1fb" : "#6366f1",
              cursor: loading || !description.trim() ? "not-allowed" : "pointer"
            }}
          >
            {loading ? (
              <>
                <svg
                  className="spinner text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span className="ml-2">Création...</span>
              </>
            ) : (
              "Créer"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}