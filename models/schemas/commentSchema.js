const { Schema, model } = require('mongoose');
const setUniqueAndRequired = require('../uniqueRequired');

const commentSchema = new Schema(
    {
        author: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: 'The author field is required',
            unique: true
        },
        comment: {
            type: String,
        },
        hasBeenEdited: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
)


module.exports = model('Comment', commentSchema);