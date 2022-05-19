const User = require('../models/User');

function createUser(req, res) {
  const { name, about, avatar } = req.body;

  if (!name || !about || !avatar) {
    res.status(400).send({ message: 'Переданы некоректные данные' });
    return;
  }

  User.create({ name, about, avatar })
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        const fields = Object.keys(err.errors).join(', ');
        return res.status(400).send({ message: `поле(я) '${fields}' введены некорректно` });
      }
      return res.status(500).send({ message: 'Произошла ошибка' });
    });
}

function getUser(req, res) {
  const { userId } = req.params;

  if (!userId) {
    res.status(400).send({ message: 'Пользователь не был передан' });
    return;
  }

  User.findById({ _id: userId })
    .orFail(new Error('NotValidUserId'))
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      if (err.message === 'NotValidUserId') {
        return res.status(404).send({ message: 'Пользователя нет в базе данных' });
      }
      return res.status(500).send({ message: 'Произошла ошибка' });
    });
}

function getUsers(req, res) {
  User.find()
    .then((users) => {
      res.status(200).send(users);
    })
    .catch(() => {
      res.status(500).send({ message: 'Произошла ошибка' });
    });
}

function updateProfile(req, res) {
  User.findByIdAndUpdate(req.user._id, req.body, { new: true, runValidators: true })
    .orFail(new Error('NotValidUserId'))
    .then((user) => {
      res.status(200).send(user);
    })
    .catch((err) => {
      if (err.message === 'NotValidUserId') {
        res.status(404).send({ message: 'Пользователя нет в базе данных' });
      } else {
        (
          res.status(500).send({ message: 'Произошла ошибка' })
        );
      }
    });
}

function updateAvatar(req, res) {
  const { avatar } = req.body;
  if (!avatar) {
    res.status(400).send({ message: 'Не передана ссылка' });
  }
  User.findByIdAndUpdate(req.user._id, { avatar }, { new: true, runValidators: true })
    .orFail(new Error('NotValidUserId'))
    .then((sendAvatar) => {
      res.status(200).send(sendAvatar);
    })
    .catch((err) => {
      if (err.message === 'NotValidUserId') {
        res.status(404).send({ message: 'Пользователя нет в базе данных' });
      } else {
        (
          res.status(500).send({ message: 'Произошла ошибка' })
        );
      }
    });
}

module.exports = {
  createUser,
  getUser,
  getUsers,
  updateProfile,
  updateAvatar,
};
