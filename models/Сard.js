const isUrl = require('validator/lib/isURL');
const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  name: {
    type: String, required: true, minlength: 2, maxlength: 30,
  },
  link: {
    type: String,
    validate: { validator: (link) => isUrl(link), message: 'is not a valid link' },
    required: true,
  },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user', default: [] }],
  createdAt: { type: Date, default: Date.now },
}, { versionKey: false });

module.exports = mongoose.model('Card', cardSchema);
