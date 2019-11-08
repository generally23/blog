const { Schema, model } = require('mongoose');
const setUniqueAndRequired = require('../utils');
const tagSchema = require('./tagSchema');
const reviewSchema = require('./reviewSchema');


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
            maxlength: 100
        },
        reviews: [reviewSchema], // Embeded,
        tags: [tagSchema], // Embeded
        author: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true
        },
        comments: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Comment',
            }
        ],
    },
    {
        timestamps: true
    }
);

module.exports = model('Post', postSchema);