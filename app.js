const path = require('path')

const express = require('express')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp')

const AppError = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorController')
const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/userRoutes')
const reviewRouter = require('./routes/reviewRoutes')
const viewRouter = require('./routes/viewRoutes')
const bookingRouter = require('./routes/bookingRoutes')
const compression = require('compression')
const cookieParser = require('cookie-parser')
const app = express()
app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))
app.use(
   helmet.contentSecurityPolicy({
      directives: {
         defaultSrc: ["'self'", 'ws://localhost:1234/'],
         imgSrc: [
            "'self'",
            'data:',
            'https://unpkg.com',
            'https://tile.openstreetmap.org',
            'https://tiles.stadiamaps.com',
         ],
         scriptSrc: ["'self'", 'https://unpkg.com', 'https://js.stripe.com'],
         // ... more directives
         frameSrc: ["'self'", 'https://js.stripe.com'],
      },
   })
)
app.use(cookieParser())

if (process.env.NODE_ENV === 'development') {
   app.use(morgan('dev'))
}

const limiter = rateLimit({
   max: 100,
   windowMs: 60 * 60 * 1000,
   message: 'Too many requests from this IP, please try again in an hour!',
})
app.use('/api', limiter)

app.use(express.json({ limit: '10kb' }))

app.use(mongoSanitize())

app.use(xss())

app.use(
   hpp({
      whitelist: [
         'duration',
         'ratingsQuantity',
         'ratingsAverage',
         'maxGroupSize',
         'difficulty',
         'price',
      ],
   })
)

app.use(compression())

app.use(express.static(`${__dirname}/public`))

// app.use((req, res, next) => {
//   req.requestTime = new Date().toISOString();
//   next();
// });

// 3) ROUTES
app.use('/', viewRouter)
app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/reviews', reviewRouter)
app.use('/api/v1/bookings', bookingRouter)

app.all('*', (req, res, next) => {
   next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404))
})

app.use(globalErrorHandler)

module.exports = app
