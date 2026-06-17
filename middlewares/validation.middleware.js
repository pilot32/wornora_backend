const validationMiddleware = (schema)=>(req,res,next)=>{
    const {error,value} = schema.validate(req.body,{
        abortEarly: false,
        stripUnknown: true,
    });
    if(error){
        return res.status(400).json({message: 'validation failed',error: error.details[0].message});
    }
    req.body = value;
    next();
};

module.exports = validationMiddleware;