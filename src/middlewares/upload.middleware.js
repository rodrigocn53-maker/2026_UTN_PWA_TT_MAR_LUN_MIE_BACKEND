import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configurar Cloudinary
// Si existe CLOUDINARY_URL en .env, el SDK se autoconfigura.
// Solo configuramos manualmente si estamos usando los valores por separado.
if (!process.env.CLOUDINARY_URL) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Definimos si es imagen o audio (o video para audios como mp4)
    let resourceType = 'image';
    if (file.mimetype.startsWith('audio/') || file.mimetype.startsWith('video/')) {
        resourceType = 'video'; // Cloudinary trata audio y video como 'video'
    }

    return {
      folder: 'slack-clone-uploads',
      resource_type: resourceType,
      allowed_formats: ['jpg', 'png', 'gif', 'jpeg', 'mp3', 'wav', 'mp4', 'mpeg'],
    };
  },
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/mp4', 'video/mp4'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Formato de archivo no soportado'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

export default upload;
