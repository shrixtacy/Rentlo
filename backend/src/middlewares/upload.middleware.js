import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../configs/cloudinary.config.js';

const makeStorage = (folder, resourceType, allowedFormats) =>
  new CloudinaryStorage({
    cloudinary,
    params: {
      folder,
      resource_type: resourceType,
      allowed_formats: allowedFormats,
    },
  });

const fileSizeLimitMB = (mb) => mb * 1024 * 1024;

export const uploadAvatar = multer({
  storage: makeStorage('rentlo/avatars', 'image', ['jpg', 'png', 'webp']),
  limits: { fileSize: fileSizeLimitMB(2) },
}).single('avatar');

export const uploadKYC = multer({
  storage: makeStorage('rentlo/kyc', 'image', ['jpg', 'png', 'pdf']),
  limits: { fileSize: fileSizeLimitMB(5) },
}).single('document');

export const uploadListingImages = multer({
  storage: makeStorage('rentlo/listings', 'image', ['jpg', 'png', 'webp']),
  limits: { fileSize: fileSizeLimitMB(5) },
}).array('images', 6);

export const uploadHandoverPhotos = multer({
  storage: makeStorage('rentlo/handover', 'image', ['jpg', 'png', 'webp']),
}).array('photos', 10);

export const uploadReturnPhotos = multer({
  storage: makeStorage('rentlo/returns', 'image', ['jpg', 'png', 'webp']),
}).array('photos', 10);

export const uploadDisputeEvidence = multer({
  storage: makeStorage('rentlo/disputes', 'image', ['jpg', 'png', 'webp']),
}).array('evidence', 10);
