const { Schema, model } = require('mongoose');
const setUniqueAndRequired = require('../utils');

const tagSchema = new Schema(
    {
        tagName: {
            type: String,
            required: 'The tag name field is required'
        },
        author: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    {
        timestamps: true
    }
)


module.exports = tagSchema;