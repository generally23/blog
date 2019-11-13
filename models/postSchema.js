const { Schema, model } = require('mongoose');
const slugify = require('slugify');
const reviewSchema = require('./reviewSchema');
const Comment = require('./commentSchema');

const postSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true
    },
    summary: {
      type: String,
      required: true,
      unique: true,
      minlength: 100,
      maxlength: 300
    },
    cover: {
      type: String,
      default: '' // some cover image
    },
    content: {
      type: String,
      required: true
    },
    slug: {
      type: String,
      maxlength: 100,
      lowercase: true,
      default: function() {
        return slugify(this.title);
      },
      required: true,
      unique: true
    },
    reviews: [reviewSchema], // Embeded,
    tags: [String], // Embeded
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

// middleware
postSchema.virtual('virtualAuthor', {
  ref: 'User',
  localField: 'author',
  foreignField: '_id'
});

// remove all comments on this post when deleted
postSchema.pre('remove', function(next) {
  Comment.deleteMany({ post: this._id });
  next();
});

module.exports = model('Post', postSchema);
