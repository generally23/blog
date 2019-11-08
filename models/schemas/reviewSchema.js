const { Schema, model } = require('mongoose');
const setUniqueAndRequired = require('../utils');

const reviewSchema = new Schema(
    {
        rating: {
            type: Number,
            min: 1,
            max: 5,
            require: [true, 'The rating filed is required']
        },
        author: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        }
    },
    {
        timestamps: true
    }
)


module.exports = reviewSchema;