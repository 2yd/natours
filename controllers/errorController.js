const AppError = require('../utils/appError')

const handleCastErrorDB = err => {
   const message = `Invalid ${err.path}: ${err.value}`
   return new AppError(message, 400)
}
const handleDuplicateFieldsDB = err => {
   const message = `Duplicate field value: ${Object.values(err.keyValue).join(
      ', '
   )}. Please use another one`
   return new AppError(message, 400)
}
const handleValidatorErrorDB = err => {
   const errors = Object.values(err.errors).map(el => el.message)
   const message = `Invalid input data. ${errors.join('. ')}`
   return new AppError(message, 400)
}
const handleJWTError = () =>
   new AppError('Invalid token. Please login again!', 401)
const handleJWTExpiredError = () =>
   new AppError('Token expired!. Please login again!', 401)

const sendErrorDev = (err, req, res) => {
   if (req.originalUrl.startsWith('/api')) {
      return res.status(err.statusCode).json({
         error: err,
         status: err.status,
         message: err.message,
         stack: err.stack,
      })
   } else {
      return res.status(err.statusCode).render('error', {
         title: 'Something went wrong!',
         msg: err.message,
      })
   }
}
const sendErrorProd = (err, req, res) => {
   if (req.originalUrl.startsWith('/api')) {
      if (err.isOperational)
         res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
         })
      else {
         console.log('Error!!!!!', err)
         res.status(500).json({
            status: 'error',
            message: 'Something went wrong',
         })
      }
   } else {
      if (err.isOperational)
         res.status(err.statusCode).render('error', {
            title: 'Something went wrong!',
            msg: `但我觉得这不是我的问题:
            ${err.message}`,
         })
      else {
         res.status(500).render('error', {
            title: 'Something went wrong!',
            msg: '我的问题，请稍后再试',
         })
      }
   }
}
module.exports = (err, req, res, next) => {
   err.statusCode = err.statusCode || 500
   err.status = err.status || 'error'

   if (process.env.NODE_ENV === 'development') {
      sendErrorDev(err, req, res)
   } else if (process.env.NODE_ENV === 'production') {
      let error = { ...err }
      error.message = err.message

      if (err.name === 'CastError') {
         error = handleCastErrorDB(error)
      }
      if (err.code === 11000) error = handleDuplicateFieldsDB(error)
      if (err.name === 'ValidationError') error = handleValidatorErrorDB(error)
      if (err.name === 'JsonWebTokenError') error = handleJWTError()
      if (err.name === 'TokenExpiredError') error = handleJWTExpiredError()
      sendErrorProd(error, req, res)
   }
}
