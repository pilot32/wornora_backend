const User = require('../users/user.models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { asyncHandler } = require('../../utils/asyncHandler');
const { ApiError } = require('../../utils/ApiError');
const { ApiResponse } = require('../../utils/ApiResponse');

const register = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
        throw new ApiError(400, "User with this email already exists");
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        name: name,
        email: email,
        password: hashedPassword,
    });

    return res.status(200).json(
        new ApiResponse(200, user, "User successfully created")
    );
});

//function for logging in the user
const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
        throw new ApiError(400, "User not found");
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
        throw new ApiError(400, "Incorrect password");
    }
    const token = jwt.sign(
        {
            userId: user._id,
            role: user.role,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: '7d',
        }
    );

    return res.status(200).json(
        new ApiResponse(200, { user, token }, "Login Successful")
    );
});

module.exports = {
    register,
    login,
}
