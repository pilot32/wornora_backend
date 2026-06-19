// Add a second parameter "source" with a default value of 'body'
const validationMiddleware = (schema, source = 'body') => (req, res, next) => {
    
    // Validate the correct part of the request (req.body, req.query, or req.params)
    const {error, value} = schema.validate(req[source], {
        abortEarly: false,
        stripUnknown: true,
    });
    
    if(error){
        return res.status(400).json({message: 'validation failed', error: error.details[0].message});
    }
    
    // Update the correct part of the request with the validated/formatted values
    req[source] = value;
    next();
};

module.exports = validationMiddleware;