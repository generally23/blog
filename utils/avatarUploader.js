const multer = require('multer');
const ApplicationError = require('./AppError');

const resolveDestination = path => (req, file, cb) => cb(null, path);

const generateFilename = (req, file, cb) => {
  cb(null, `${file.fieldname}-${req.user._id}`);
};

const fileFilter = (req, file, cb) => {
  const { mimetype } = file;

  // if (!mimetype.match(/image\/.*/)) {
  //   cb(
  //     new ApplicationError(
  //       'Please upload an image with the extensions: png, jpeg, webp'
  //     )
  //   );
  // }
  cb(null, true);
};

const storage = multer.diskStorage({
  destination: resolveDestination('uploads'),
  filename: generateFilename,
});

const upload = multer({ storage, fileFilter, limits: { fileSize: 1024 * 5 } });

module.exports = upload;
