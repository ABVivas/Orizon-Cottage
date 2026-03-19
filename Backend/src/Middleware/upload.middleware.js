// Backend/src/Middleware/upload.middleware.js
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Asegurar que la carpeta uploads existe
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configurar almacenamiento
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        // Crear nombre único SIN caracteres especiales
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        
        // Eliminar caracteres especiales del nombre original
        const originalName = file.originalname
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Eliminar tildes
            .replace(/[^a-zA-Z0-9.]/g, '_') // Reemplazar caracteres especiales por _
            .replace(/_+/g, '_'); // Reemplazar múltiples _ por uno solo
        
        const ext = path.extname(originalName);
        const name = path.basename(originalName, ext);
        
        cb(null, `${name}-${uniqueSuffix}${ext}`);
    }
});

// Filtrar tipos de archivo permitidos
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'image/jpeg',
        'image/png'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Tipo de archivo no permitido. Solo PDF, Word, TXT, JPG, PNG'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB máximo
    }
});

export default upload;