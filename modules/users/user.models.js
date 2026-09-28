const mongoose = require('mongoose');
const USER_ROLES = require('../../constants/roles');


const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
            select: false,
        },
        role: {
            type: String,
            enum: [USER_ROLES.ADMIN, USER_ROLES.USER],
            default: USER_ROLES.USER,

        }
    },
    {
        timestamps: true,
    }
);

userSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;
    return user;
};

module.exports = mongoose.model('User',userSchema);
