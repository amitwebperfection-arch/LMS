const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadsDir = './uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});


const fileFilter = (req, file, cb) => {
  
  const imageTypes = /jpeg|jpg|png|gif|webp/;
 
  const videoTypes = /mp4|mpeg|mov|avi|wmv|flv|webm/;

  const extname = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype;

  if (file.fieldname === 'thumbnail' || file.fieldname === 'image') {
  
    if (imageTypes.test(extname) && mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for thumbnail/image!'));
    }
  } else if (file.fieldname === 'promoVideo' || file.fieldname === 'video') {
    
    if (videoTypes.test(extname.replace('.', '')) && mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed for promo video!'));
    }
  } else {
    cb(null, true);
  }
};


const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, 
  },
});


const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 100MB',
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  } else if (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
  next();
};


module.exports = {
 
  uploadSingle: (fieldName) => upload.single(fieldName),

  
  uploadMultiple: (fieldName, maxCount) => upload.array(fieldName, maxCount),

 
  uploadFields: (fields) => upload.fields(fields),

  
  uploadCourseFiles: upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'promoVideo', maxCount: 1 },
  ]),

  
  uploadLessonFiles: upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'resources', maxCount: 5 },
  ]),

  
  handleUploadError,
  upload,
};