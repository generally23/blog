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
    poster: {
      type: String
    },
    summary: {
      type: String,
      required: true,
      unique: true,
      maxlength: 300
    },
    content: {
      type: String,
      required: true,
      unique: true
    },
    slug: {
      type: String,
      lowercase: true,
      required: true,
      unique: true
    },
    //reviews: [reviewSchema], // Embeded,
    //tags: [String], // Embeded
    authorId: {
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
  Comment.deleteMany({ postId: this._id });
  next();
});

module.exports = model('Post', postSchema);
