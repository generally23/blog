const { Schema, model } = require('mongoose');
const Comment = require('./comment');
const { default: slugify } = require('slugify');

const postSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
    },
    poster: {
      type: String,
    },
    summary: {
      type: String,
      required: true,
      unique: true,
      maxlength: 300,
    },
    content: {
      type: String,
      required: true,
      unique: true,
    },
    slug: {
      type: String,
      lowercase: true,
      required: true,
      unique: true,
    },
    //reviews: [reviewSchema], // Embeded,
    //tags: [String], // Embeded
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      lowercase: true,
      required: true,
      enum: ['web development', 'it upport'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// middleware
postSchema.virtual('virtualAuthor', {
  ref: 'User',
  localField: 'authorId',
  foreignField: '_id',
});

// update slug if title changed
postSchema.pre('save', function (next) {
  const post = this;
  if (post.isModified('title')) {
    post.slug = slugify(post.title);
  }
  next();
});

// remove all comments on this post when deleted
postSchema.pre('remove', function (next) {
  Comment.deleteMany({ postId: this._id });
  next();
});

module.exports = model('Post', postSchema);
