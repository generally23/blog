const { Schema, model } = require('mongoose');
const { hash, compare } = require('bcrypt');
const crypto = require('crypto');
const Post = require('./postSchema');
const Comment = require('./commentSchema');

const userSchema = new Schema(
  {
    username: {
      type: String,
      unique: true,
      required: true,
      maxlength: 15,
      minlength: 5
    },
    email: {
      type: String,
      required: [true, 'You must register with an email'],
      unique: true
    },
    role: {
      type: String,
      enum: ['Admin', 'User'],
      default: 'User'
    },
    isActive: {
      type: Boolean,
      default: false,
      select: false
    },
    password: {
      type: String,
      required: [true, 'You must create a password to create an account'],
      select: false,
      unique: true,
      minlength: [8, 'Your password must be at least 8 characters long'],
      maxlength: [32, 'Your password must be at most 32 characters long']
    },
    confirmedPassword: {
      type: String,
      required: [true, 'You must confirm your password to make sure you rember it'],
      unique: true,
      validate: {
        validator(value) {
          return value === this.password;
        }
      },
      select: false,
      minlength: [8, 'Your password must be at least 8 characters long'],
      maxlength: [32, 'Your password must be at most 32 characters long']
    },
    passwordChangeTime: {
      type: Date,
      select: false
    },
    passwordResetToken: {
      type: String
    },
    passwordResetTokenExpiresIn: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// middleware
userSchema.pre('save', async function(next) {
  const user = this;
  if (!this.isModified('password')) return next();
  user.password = await hash(user.password, 10);
  user.confirmedPassword = user.password;
  next();
});

// remove all user data when user is removed
userSchema.pre('remove', async function(next) {
  const authorId = this._id;
  // all posts
  await Post.deleteMany({ authorId });
  // all coments
  await Comment.deleteMany({ authorId });
  next();
});



/* MONGOOSE DOCUMENT INSTANCE METHODS */

// password verification
userSchema.methods.verifyPassword = async (password, hashedPassword) => {
  return await compare(password, hashedPassword);
};

// check if user has changed their password after the token was issued
userSchema.methods.updatedPasswordAfter = function(tokenIssuanceDate) {
  if (!this.passwordChangeTime) return false;
  return tokenIssuanceDate < this.passwordChangeTime.getTime() / 1000;
};

// prevent certain properties from being leaked
// userSchema.methods.toJSON = function() {
//   return this.deleteProperties(
//     'password',
//     'confirmedPassword',
//     'isActive',
//     'passwordChangeTime'
//   );
// };

// password forgotten
userSchema.methods.generatePasswordResetToken = function() {
  // create random reset token
  const resetToken = crypto.randomBytes(40).toString('hex');
  // set encrypted reset token to document
  this.passwordResetToken = crypto.createHash('sha256')
    .update(resetToken)
    .digest('hex')
  // set the expiration time of the token to 15min
  this.passwordResetTokenExpiresIn = Date.now() + (15 * 60 * 1000);
  // return the token
  return resetToken;
};

userSchema.methods.deleteProperties = function(...properties) {
  const src = this.toObject();
  properties.forEach(prop => delete src[prop]);
  return src;
};

module.exports = model('User', userSchema);

