const express = require('express')
const viewController = require('./../controllers/viewController')
const authController = require('./../controllers/authController')
const bookingController = require('./../controllers/bookingController')
const router = express.Router()

router.use(authController.isLoggedIn)

router.get(
   '/',
   bookingController.createBookingCheckout,
   authController.isLoggedIn,
   viewController.getOverview
)
router.get('/me', authController.protect, viewController.getAccount)
router.get('/tour/:slug', viewController.getTour)
router.get('/login', viewController.getLoginForm)
router.get('/my-tours', authController.protect, viewController.getMyTours)

module.exports = router
