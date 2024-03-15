const express = require('express')
const userController = require('../controllers/userController')
const authController = require('../controllers/authController')
const multer = require('multer')

const upload = multer({ dest: 'public/img/users' })

const router = express.Router()
router.post('/signup', authController.signup)
router.post('/login', authController.login)
router.get('/logout', authController.logout)
router.post('/forget-password', authController.forgetPassword)
router.patch('/reset-password/:token', authController.resetPassword)

router.use(authController.protect)
router.patch(
   '/update-me',
   userController.uploadUserPhoto,
   userController.resizeUserPhoto,
   userController.updateMe
)
router.get('/me', userController.getMe, userController.getUser)

router.patch('/update-password', authController.updatePassword)
router.delete('/delete-me', userController.deleteMe)

router.use(authController.restrictTo('admin'))

router.route('/').get(userController.getAllUsers)
router
   .route('/:id')
   .get(userController.getUser)
   .patch(userController.updateUser)
   .delete(userController.deleteUser)

module.exports = router
