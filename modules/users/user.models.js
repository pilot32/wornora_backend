const mongoose = require('mongoose');


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
        },
        role: {
            type: String,
            enum: ['ADMIN', 'CUSTOMER'],
            default: 'CUSTOMER',

        }
    },
    {
        timeStamps: true,
    }
);

module.exports = mongoose.model('User',userSchema);
