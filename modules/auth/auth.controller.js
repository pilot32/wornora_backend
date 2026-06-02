const User = require('../users/user.models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const register = async(req,res)=>{
    try{    
        const {name,email,password}=req.body;
        const existingUser = await User.findOne({email: email});
        if(existingUser){
            return res
            .status(400)
            .json({
                "message":"User with this email already exists"
            });    
        }
        const hashedPassword = await bcrypt.hash(password,10);

        const user = await User.create({
            name: name,
            email: email,
            password: hashedPassword,
            
        });
        res.status(200)
        .json({"message":"User succesfully created"});
    }
    catch(err){
        res.status(500)
        .json({message: err.message});
    }
}
//function for loggin in the user


const login = async(req, res)=>{
    try{
    const{email,password}=req.body;
    const user = await User.findOne({email: email});
    if(!user){
        return res
        .status(400)
        .json({"message": "User not found"});
    }
    const isPasswordMatch = await bcrypt
    .compare(password,user.password);
    if(!isPasswordMatch){
        return res
        .status(400)
        .json({"message": "Icncorrect password"});
    }
    const token = jwt.sign(
        {userId: user._id,
        role: user.role,
    },
    process.env.JWT_SECRET,
    {
        expiresIn: '7d',
    }
    );
    res.status(200)
    .json({"message":"Login Succesful",user,token});
}
catch(err){
    res.status(500)
    .json({message: err.message});  



}

}


module.exports = {
    register,
    login,
}