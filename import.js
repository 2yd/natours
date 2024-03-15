const fs = require('fs')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const Tour = require('./models/tourModel')
const Review = require('./models/reviewModel')
const User = require('./models/userModel')
dotenv.config({
   path: './config.env',
})
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.PASSWORD)
mongoose.connect(DB).then(con => {
   console.log('DB connection succeeded!')
})

const app = require('./app')
const port = process.env.PORT || 4396
app.listen(port, () => {
   console.log(`Server started on port ${port}`)
})

const tours = fs.readFileSync(
   `${__dirname}\\dev-data\\data\\tours.json`,
   'utf-8'
)
const users = fs.readFileSync(
   `${__dirname}\\dev-data\\data\\users.json`,
   'utf-8'
)
const reviews = fs.readFileSync(
   `${__dirname}\\dev-data\\data\\reviews.json`,
   'utf-8'
)

const importData = async () => {
   try {
      await Tour.create(JSON.parse(tours))
      await User.create(JSON.parse(users), {
         validateBeforeSave: false,
      })
      await Review.create(JSON.parse(reviews))
      console.log('success import')
   } catch (err) {
      console.log(err)
   }
}
const deleteData = async () => {
   try {
      await Tour.deleteMany()
      await User.deleteMany()
      await Review.deleteMany()
      console.log('success delete')
   } catch (err) {
      console.log(err)
   }
}
if (process.argv[2] == '--import') {
   importData()
} else if (process.argv[2] == '--delete') {
   deleteData()
}
