const { Schema, model } = require("mongoose");

const commentSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    content: {
      type: String,
      required: true
    },
    isEdited: {
      type: Boolean,
      default: false
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true
    },
    replyTo: {
      type: Schema.Types.ObjectId,
      ref: 'Comment'
    }
  },
  {
    timestamps: true
  }
);

const Comment = model("Comment", commentSchema);

// delete all replies if a comment is deleted
commentSchema.pre("remove", async function(next) {
  await Comment.deleteMany({ replyTo: this._id });
  next();
});

module.exports = Comment;
