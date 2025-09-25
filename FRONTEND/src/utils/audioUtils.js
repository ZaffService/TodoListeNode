// audioUtils.js - Créez ce fichier dans src/utils/
export const checkAudioSupport = () => {
  const supportedTypes = [];
  const typesToCheck = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/ogg;codecs=opus',
    'audio/wav'
  ];

  typesToCheck.forEach(type => {
    if (MediaRecorder.isTypeSupported(type)) {
      supportedTypes.push(type);
    }
  });

  console.log('Types audio supportés:', supportedTypes);
  return supportedTypes;
};

export const getBestAudioFormat = () => {
  const supportedTypes = checkAudioSupport();
  
  // Ordre de préférence
  const preferredOrder = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/ogg;codecs=opus',
    'audio/wav'
  ];

  for (const type of preferredOrder) {
    if (supportedTypes.includes(type)) {
      return type;
    }
  }

  return null;
};

export const getFileExtension = (mimeType) => {
  const extensionMap = {
    'audio/webm': '.webm',
    'audio/webm;codecs=opus': '.webm',
    'audio/mp4': '.m4a',
    'audio/ogg': '.ogg',
    'audio/ogg;codecs=opus': '.ogg',
    'audio/wav': '.wav'
  };

  return extensionMap[mimeType] || '.webm';
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};