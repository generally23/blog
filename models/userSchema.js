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
      maxlength: 50,
      minlength: 5
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user'
    },
    isActive: {
      type: Boolean,
      default: false,
      select: false
    },
    password: {
      type: String,
      required: true,
      select: false,
      unique: true,
      minlength: 8
    },
    confirmedPassword: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator(value) {
          return value === this.password;
        }
      },
      select: false,
      minlength: 8
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

// remove all user posts if deleted
userSchema.pre('remove', async function(next) {
  await Post.deleteMany({ author: this._id });
  next();
});

// remove all comments if deleted
userSchema.pre('remove', async function(next) {
  await Comment.deleteMany({ author: this._id });
  next();
});

/* MONGOOSE DOCUMENT INSTANCE METHODS */

// password verification
userSchema.methods.verifyPassword = async (password, hashedPassword) => {
  return await compare(password, hashedPassword);
};

// check if user has changed their password after the token was issued
userSchema.methods.updatedPasswordAfter = function(tokenIssuedDate) {
  if (!this.passwordChangeTime) return false;
  return tokenIssuedDate < this.passwordChangeTime.getTime() / 1000;
};

// prevent certain properties from being leaked
userSchema.methods.toJSON = function() {
  return this.deleteProperties(
    'password',
    'confirmedPassword',
    'isActive',
    'passwordChangeTime'
  );
};

// password forgotten
userSchema.methods.generatePasswordResetToken = function() {
  // create random reset token
  const resetToken = crypto.randomBytes(40).toString('hex');
  // set encrypted reset token to document
  this.passwordResetToken = crypto.createHash('sha256')
    .update(resetToken)
    .digest('hex')
  // set the expiration time of the token to 15min
  this.passwordResetTokenExpiresIn = Date.now() + 15 * 60 * 1000;
  // return the token
  return resetToken;
};

userSchema.methods.deleteProperties = function(...properties) {
  const src = this.toObject();
  properties.forEach(prop => delete src[prop]);
  return src;
};

module.exports = model('User', userSchema);

