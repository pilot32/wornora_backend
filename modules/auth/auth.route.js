const express = require('express');
const router = express.Router();


const {register,login} = require('./auth.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');

router.post('/register', register);
router.post('/login', login);
router.get('/profile', authMiddleware,(req,res)=>{
    res.json({user: req.user});
});
router.post('/test-admin', authMiddleware, roleMiddleware("ADMIN"), (req,res) => {
    res.json({ message: 'Admin access granted'});
});


module.exports = router;