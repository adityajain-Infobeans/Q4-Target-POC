const mongoose = require('mongoose');
const { Schema } = mongoose;

const listSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  author_id: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'user',
  },
});

listSchema.virtual('tasks', {
  ref: 'task', //The Model to use
  localField: '_id', //Find in Model, where local key
  foreignField: 'list_id', // is equal to foreign key
});

// Set Object and Json property to true. Default is set to false
listSchema.set('toObject', { virtuals: true });
listSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('List', listSchema);
