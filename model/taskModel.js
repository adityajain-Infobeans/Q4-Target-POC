const mongoose = require('mongoose');
const { Schema } = mongoose;

const taskSchema = new Schema({
  list_id: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'list',
  },
  task_description: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('Task', taskSchema);
