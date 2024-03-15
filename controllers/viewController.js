const Tour = require('../models/tourModel')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const Booking = require('../models/bookingModel')
exports.getOverview = catchAsync(async (req, res) => {
   const tours = await Tour.find()
   res.status(200).render('overview', {
      title: 'All tours',
      tours,
   })
})
exports.getTour = catchAsync(async (req, res, next) => {
   const { slug } = req.params
   const tour = await Tour.findOne({ slug: slug }).populate({
      path: 'reviews',
      fields: 'review rating user',
   })
   if (!tour) {
      return next(new AppError('There is no tour with that name.', 404))
   }
   res.status(200).render('tour', {
      title: `${tour.name} Tour`,
      tour,
   })
})

exports.getLoginForm = (req, res) => {
   res.status(200).render('login', {
      title: 'Log into your account',
   })
}

exports.getAccount = (req, res) => {
   res.status(200).render('account', {
      title: 'Your account',
      user: req.user,
   })
}

exports.getMyTours = catchAsync(async (req, res, next) => {
   const bookings = await Booking.find({ user: req.user.id })
   const tourIds = bookings.map(el => el.tour)
   const tours = await Tour.find({ _id: { $in: tourIds } })
   res.status(200).render('overview', {
      title: 'My tours',
      tours,
   })
})
