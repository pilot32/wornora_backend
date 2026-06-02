const jwt = require('jsonwebtoken');

const authMiddleware = (req,res,next)=>{
    try{
        const authHeader = req.headers.authorization;
        if(!authHeader){
            return res.status(401)
            .json({"message": "Authentication token missig"})
        }
        const tokenParts = authHeader.split(" ");
        let token = authHeader;

        if(tokenParts.length === 2 && tokenParts[0].toLowerCase() === 'bearer'){
            token = tokenParts[1];
        } else if(tokenParts.length === 1) {
        } else {
            return res.status(401).json({"message": "Invalid authorization header format"});
        }
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        req.user = decoded;
        next();


    }
    catch(err){
        return res.status(401).json({"message": "Invalid authentication token"});
    }
}

module.exports = authMiddleware;