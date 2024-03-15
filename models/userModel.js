const crypto = require('crypto')
const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const userSchema = new mongoose.Schema({
   name: {
      type: String,
      required: [true, 'Please tell us your name!'],
   },
   email: {
      type: String,
      required: [true, 'Please tell us your email!'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Invalid email'],
   },
   photo: { type: String, default: 'default.jpg' },
   role: {
      type: String,
      enum: ['user', 'guide', 'lead-guide', 'admin'],
      default: 'user',
   },
   password: {
      type: String,
      required: [true, 'Please set your password!'],
      minlength: 8,
      select: false,
   },
   passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password!'],
      validate: {
         validator: function (el) {
            return el === this.password
         },
         message: 'Password are not the same!',
      },
   },
   active: {
      type: Boolean,
      default: true,
      select: false,
   },
   passwordChangedAt: Date,
   passwordResetToken: String,
   passwordResetExpires: Date,
})
userSchema.pre('find', function (next) {
   this.find({ active: { $ne: false } })
   next()
})
userSchema.pre('save', async function (next) {
   if (!this.isModified('password')) return next()
   this.password = await bcrypt.hash(this.password, 12)
   this.passwordConfirm = undefined
   next()
})

userSchema.pre('save', async function (next) {
   if (!this.isModified('password') || this.isNew) return next()
   this.passwordChangedAt = Date.now() - 1000
   next()
})

userSchema.methods.isCorrectPassword = async function (
   candidatePassword,
   userPassword
) {
   return await bcrypt.compare(candidatePassword, userPassword)
}
userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
   if (this.passwordChangedAt) {
      const changedTimestamp = this.passwordChangedAt.getTime()
      return changedTimestamp > JWTTimeStamp
   }
   return false
}
userSchema.methods.createPasswordResetToken = function () {
   const resetToken = crypto.randomBytes(32).toString('hex')
   this.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex')
   this.passwordResetExpires = Date.now() + 10 * 60 * 1000
   return resetToken
}

const User = mongoose.model('User', userSchema)
module.exports = User
