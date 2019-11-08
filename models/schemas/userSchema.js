const { Schema, model } = require('mongoose');
const { hash, compare } = require('bcrypt');
const { deleteProperties } = require('../utils');

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
            unique: true
        },
        confirmedPassword: {
            type: String,
            required: true,
            unique: true,
            validate: {
                validator (value) {
                    return value === this.password;
                }
            },
            select: false
        },
        passwordChangeTime: {
            type: Date,
            select: false
        }
    },
    {
        timestamps: true
    }
);

// middleware 
userSchema.pre('save', async function (next) {
    const user = this;
    if (!this.isModified('password')) next();
    user.password = await hash(user.password, 10);
    user.confirmedPassword = user.password;
    next();
})

// password verification
userSchema.methods.verifyPassword = async (password, hashedPassword) => {
    return await compare(password, hashedPassword);
}

// check if user has changed their password after the token was issued
userSchema.methods.updatedPasswordAfter = function (tokenIssuedDate) {
    if (!this.passwordChangeTime) return false;
    return tokenIssuedDate < this.passwordChangeTime.getTime() / 1000;
}

// prevent certain properties from being leaked
userSchema.methods.toJSON = function () {
    const user = this;
    const userCopy = user.toObject();
    const cleanedUserObject = deleteProperties(userCopy, 'password', 'confirmedPassword', 'isActive', 'passwordChangeTime');
    return cleanedUserObject;
}

module.exports = model('User', userSchema);



