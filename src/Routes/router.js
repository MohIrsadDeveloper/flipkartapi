const express = require('express')
const router = express.Router();

const authController = require('../Controllers/authController')


router.post('/login', authController.login)
router.post('/register', authController.register)
router.get('/userInfo', authController.userInfo)
router.delete('/delete', authController.deleteUsers);

module.exports = router;