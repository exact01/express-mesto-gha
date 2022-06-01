const validator = require('validator');
const bcrypt = require('bcrypt');
const { generateToken } = require('../utils/jwt');
const User = require('../models/User');
const DublicateError = require('../errors/DublicateError');
const NotFoundError = require('../errors/NotFoundError');
const ValidationError = require('../errors/ValidationError');
const AuthError = require('../errors/AuthError');

const MONGO_DUPLICATE_KEY_CODE = 11000;
const saltRounds = 10;

function login(req, res, next) {
  const { email, password } = req.body;
  if (!email || !password || !validator.isEmail(email)) {
    next(new NotFoundError('Переданы некоректные данные'));
    return;
  }
  User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        throw new AuthError('Емейл или пароль неверный');
      }
      return {
        isPasswordValid: bcrypt.compareSync(password, user.password),
        user,
      };
    })
    .then(({ isPasswordValid, user }) => {
      if (!isPasswordValid) {
        throw new ValidationError('Емейл или пароль неверный');
      }
      const jwToken = generateToken({ _id: user._id });
      return res.status(200).send({ token: jwToken });
    })
    .catch(next);
}

function createUser(req, res, next) {
  const {
    email,
    password,
  } = req.body;

  if (!email || !password || !validator.isEmail(email)) {
    next(new ValidationError('Емейл или пароль неверный'));
    return;
  }

  bcrypt.hash(password, saltRounds)
    .then((hash) => {
      User.create({ email, password: hash })
        .then((user) => {
          const jwToken = generateToken(user._id);
          return res.status(200).send({ token: jwToken });
        })
        .catch((err) => {
          if (err.code === MONGO_DUPLICATE_KEY_CODE) {
            next(new DublicateError('Такой емейл уже занят'));
            return;
          }
          next(err);
        });
    });
}

function getUserMe(req, res, next) {
  const userId = req.user._id;

  if (userId.length !== 24) {
    next(new ValidationError('Некорректный айди'));
    return;
  }

  User.findById({ _id: userId })
    .orFail(new Error('NotValidUserId'))
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      if (err.message === 'NotValidUserId') {
        next(new NotFoundError('Пользователя нет в базе данных'));
        return;
      }
      if (err.name === 'CastError') {
        next(new ValidationError('Невалидный id '));
        return;
      }
      next(err);
    });
}

function getUser(req, res, next) {
  const { userId } = req.params;

  if (userId.length !== 24) {
    next(new ValidationError('Некорректный айди'));
    return;
  }

  User.findById({ _id: userId })
    .orFail(new Error('NotValidUserId'))
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      if (err.message === 'NotValidUserId') {
        next(new NotFoundError('Пользователя нет в базе данных'));
        return;
      }
      if (err.name === 'CastError') {
        next(new ValidationError('Невалидный id '));
        return;
      }
      next(err);
    });
}

function getUsers(_req, res, next) {
  User.find()
    .then((users) => {
      res.status(200).send(users);
    })
    .catch(next);
}

function updateProfile(req, res, next) {
  const { name, about } = req.body;

  if (!name || !about) {
    next(new ValidationError('Переданы некоректные данные'));
    return;
  }

  User.findByIdAndUpdate(req.user._id, req.body, { new: true, runValidators: true })
    .orFail(new Error('NotValidUserId'))
    .then((user) => {
      res.status(200).send({ newObject: user });
    })
    .catch((err) => {
      if (err.message === 'NotValidUserId') {
        next(new NotFoundError('Пользователя нет в базе данных'));
      } else if (err.name === 'ValidationError') {
        next(new ValidationError('Переданы некоректные данные'));
      } else { next(err); }
    });
}

function updateAvatar(req, res, next) {
  const { avatar } = req.body;
  if (!avatar) {
    next(new ValidationError('Не передана ссылка'));
    return;
  }
  User.findByIdAndUpdate(req.user._id, { avatar }, { new: true, runValidators: true })
    .orFail(new Error('NotValidUserId'))
    .then((sendAvatar) => {
      res.status(200).send(sendAvatar);
    })
    .catch((err) => {
      if (err.message === 'NotValidUserId') {
        next(new NotFoundError('Пользователя нет в базе данных'));
      } else {
        next(err);
      }
    });
}

module.exports = {
  createUser,
  getUser,
  getUsers,
  updateProfile,
  updateAvatar,
  login,
  getUserMe,
};
