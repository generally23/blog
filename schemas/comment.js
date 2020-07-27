const { Schema, model } = require('mongoose');

const commentSchema = new Schema(
  {
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      minlength: [1, 'You cannot have an empty comment'],
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    postId: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
    replyTo: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

const Comment = model('Comment', commentSchema);

commentSchema.virtual('authorVirtual', {
  ref: 'User',
  localField: 'authorId',
  foreignField: '_id',
});

// delete all replies if a comment is deleted
commentSchema.pre('remove', async function (next) {
  await Comment.deleteMany({ replyTo: this._id });
  next();
});

module.exports = Comment;
