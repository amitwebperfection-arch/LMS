const cloudinary = require('cloudinary').v2;
const fs = require('fs');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadImage = async (filePath, folder = 'lms') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: 'image',
      transformation: [
        { width: 1920, height: 1080, crop: 'limit' },
        { quality: 'auto' },
        { fetch_format: 'auto' },
      ],
    });

    fs.unlinkSync(filePath);

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw new Error(`Image upload failed: ${error.message}`);
  }
};

const uploadVideo = async (filePath, folder = 'lms/videos') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: 'video',
      chunk_size: 6000000,
      eager: [
        { streaming_profile: 'hd', format: 'm3u8' },
      ],
      eager_async: true,
    });

    fs.unlinkSync(filePath);

    return {
      url: result.secure_url,
      publicId: result.public_id,
      duration: result.duration || 0,
      format: result.format,
    };
  } catch (error) {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw new Error(`Video upload failed: ${error.message}`);
  }
};


const deleteMedia = async (publicId, resourceType = 'image') => {
  try {
    if (!publicId) {
      console.log('No publicId provided for deletion');
      return null;
    }

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });

    console.log(`Deleted ${resourceType}:`, publicId, result);
    return result;
  } catch (error) {
    console.error('Error deleting media from Cloudinary:', error);
    
    return null;
  }
};


const deleteFile = deleteMedia;

const getSignedUrl = (publicId, options = {}) => {
  try {
    return cloudinary.url(publicId, {
      sign_url: true,
      type: 'authenticated',
      ...options,
    });
  } catch (error) {
    throw new Error(`Signed URL generation failed: ${error.message}`);
  }
};

module.exports = {
  cloudinary,
  uploadImage,
  uploadVideo,
  deleteMedia,  
  deleteFile,   
  getSignedUrl,
};