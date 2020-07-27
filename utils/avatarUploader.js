const multer = require('multer');
const ApplicationError = require('./AppError');

const fileFilter = (req, file, cb) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return cb(
      new ApplicationError(
        'Please upload an image with the extensions: png, jpeg, webp, gif'
      ),
      false
    );
  }
  cb(null, true);
};

const storage = multer.memoryStorage();

const uploader = multer({
  storage,
  fileFilter,
  limits: { fileSize: parseInt(process.env.MAX_AVATAR_SIZE) },
});

module.exports = uploader;
