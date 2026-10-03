const express = require('express');
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');
const USER_ROLES = require('../../constants/roles');
const { getAdminDashboard } = require('./admin-dashboard.controller');

const router = express.Router();

router.get('/dashboard', authMiddleware, roleMiddleware(USER_ROLES.ADMIN), getAdminDashboard);

module.exports = router;
