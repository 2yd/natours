const mongoose = require('mongoose')
const dotenv = require('dotenv')

process.on('unhandledRejection', err => {
   console.log(err.name, err.message)
   console.log('UNHANDLE REJECTION! SHUTTING DOWN')
   server.close(() => process.exit(1))
})
process.on('uncaughtException', err => {
   console.log(err)
   console.log('UNHANDLE EXCEPTION! SHUTTING DOWN')
   server.close(() => process.exit(1))
})
dotenv.config({
   path: './config.env',
})
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.PASSWORD)
mongoose.connect(DB).then(con => {
   console.log('DB connection succeeded!')
})

const app = require('./app')
const port = process.env.PORT || 4396
const server = app.listen(port, () => {
   console.log(`Server started on port ${port}`)
})
