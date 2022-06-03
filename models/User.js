const isEmail = require('validator/lib/isEmail');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String, minlength: 2, maxlength: 30, default: 'Жак-Ив Кусто',
  },
  about: {
    type: String, minlength: 2, maxlength: 30, default: 'Исследователь',
  },
  avatar: {
    type: String,
    default: 'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
    validate: {
      validator(v) {
        return /https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._[\]+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_[\]+.~#?&?[\]/=]*)/g.test(v);
      },
      message: 'is not a valid url',
    },
  },
  email: {
    type: String,
    validate: {
      validator: (email) => isEmail(email),
      message: 'is not a valid email',
    },
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
}, { versionKey: false });

module.exports = mongoose.model('user', userSchema);
