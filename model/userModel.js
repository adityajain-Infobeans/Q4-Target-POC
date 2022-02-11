const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  user_name: {
    type: String,
    required: true,
  },
  user_email: {
    type: String,
    required: true,
  },
  user_password: {
    type: String,
    required: true,
  },
});

userSchema.virtual('lists', {
  ref: 'list', //The Model to use
  localField: '_id', //Find in Model, where local key
  foreignField: 'author_id', // is equal to foreign key
});

// Set Object and Json property to true. Default is set to false
userSchema.set('toObject', { virtuals: true });
userSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('User', userSchema);
