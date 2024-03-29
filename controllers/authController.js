const { promisify } = require('util')
const crypto = require('crypto')
const User = require('../models/userModel')
const catchAsync = require('../utils/catchAsync')
const jwt = require('jsonwebtoken')
const AppError = require('../utils/appError')
const Email = require('../utils/email')

const signToken = id => {
   return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
   })
}
const createSendToken = (user, statusCode, res) => {
   const token = signToken(user._id)
   const cookieOptions = {
      expires: new Date(
         Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
   }
   if (process.env.NODE_ENV === 'production') cookieOptions.secure = true
   res.cookie('jwt', token, cookieOptions)
   user.password = undefined
   res.status(statusCode).json({
      status: 'success',
      token,
      data: {
         user,
      },
   })
}
exports.signup = catchAsync(async (req, res, next) => {
   const newUser = await User.create(req.body)
   const url = `${req.protocol}://${req.get('host')}/me`
   await new Email(newUser, url).sendWelcome()
   createSendToken(newUser, 201, res)
})

exports.login = catchAsync(async (req, res, next) => {
   const { email, password } = req.body
   if (!email || !password) {
      return next(new AppError('Please provide email and password', 400))
   }
   const user = await User.findOne({ email }).select('+password')
   if (!user || !(await user.isCorrectPassword(password, user.password)))
      return next(new AppError('Wrong email or password', 401))
   user.passwordChangedAt = undefined
   await user.save({ validateBeforeSave: false })
   createSendToken(user, 200, res)
})

exports.logout = (req, res) => {
   res.cookie('jwt', 'loggedout', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
   })
   res.status(200).json({ status: 'success' })
}

exports.isLoggedIn = async (req, res, next) => {
   if (req.cookies?.jwt) {
      try {
         const decoded = await promisify(jwt.verify)(
            req.cookies.jwt,
            process.env.JWT_SECRET
         )

         const currentUser = await User.findById(decoded.id)
         if (!currentUser) {
            return next()
         }
         if (currentUser.changedPasswordAfter(decoded.iat)) {
            return next()
         }
         res.locals.user = currentUser
         return next()
      } catch (error) {
         return next()
      }
   }
   next()
}

exports.protect = catchAsync(async (req, res, next) => {
   let token
   if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
   ) {
      token = req.headers.authorization.split(' ')[1]
   } else if (req.cookies.jwt) {
      token = req.cookies.jwt
   }
   if (!token) {
      return next(new AppError('You are not logged in!', 401))
   }

   const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)

   const currentUser = await User.findById(decoded.id)
   if (!currentUser) {
      return next(
         new AppError('The user belonging to this token does not exist', 401)
      )
   }
   if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next(new AppError('Password changed! Pleast login again!', 401))
   }
   req.user = currentUser
   res.locals.user = currentUser

   next()
})

exports.restrictTo = (...roles) => {
   return (req, res, next) => {
      if (!roles.includes(req.user.role)) {
         return next(
            new AppError('You do not have the permission to do this!', 403)
         )
      }
      next()
   }
}

exports.forgetPassword = catchAsync(async (req, res, next) => {
   const user = await User.findOne({
      email: req.body.email,
   })
   if (!user) {
      return next(new AppError('There is no user with this email.', 404))
   }
   const resetToken = user.createPasswordResetToken()
   await user.save({ validateBeforeSave: false })
   const resetURL = `${req.protocol}://${req.get(
      'host'
   )}/api/users/reset-password/${resetToken}`
   try {
      await new Email(user, resetURL).sendPasswordReset()
      res.status(200).json({
         status: 'success',
         message: 'Token sent to email',
      })
   } catch (err) {
      user.passwordResetToken = undefined
      user.passwordResetExpires = undefined
      await user.save({ validateBeforeSave: false })
      return next(new AppError('There was an error while sending the email!'))
   }
})
exports.resetPassword = catchAsync(async (req, res, next) => {
   const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex')
   const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
   })
   if (!user) {
      return next(new AppError('Invalid or expired token!'))
   }
   user.password = req.body.password
   user.passwordConfirm = req.body.passwordConfirm
   user.passwordResetToken = undefined
   user.passwordResetExpires = undefined
   await user.save()
   createSendToken(user, 200, res)
})

exports.updatePassword = catchAsync(async (req, res, next) => {
   const user = await User.findById(req.user.id).select('+password')
   if (
      !(await user.isCorrectPassword(req.body.passwordCurrent, user.password))
   ) {
      return next(new AppError('Your current password is wrong', 401))
   }
   user.password = req.body.password
   user.passwordConfirm = req.body.passwordConfirm
   await user.save()
   createSendToken(user, 200, res)
})
