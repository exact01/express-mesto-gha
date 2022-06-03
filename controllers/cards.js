const Card = require('../models/Сard');
const NotFoundError = require('../errors/NotFoundError');
const ValidationError = require('../errors/ValidationError');
const Forbidden = require('../errors/Forbidden');

function createCard(req, res, next) {
  const owner = req.user._id;

  const { name, link } = req.body;

  Card.create({ name, link, owner })
    .then((card) => {
      res.status(200).send(card);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        const fields = Object.keys(err.errors).join(', ');
        next(new ValidationError(`поле(я) '${fields}' введены некорректно`));
        return;
      }

      next(err);
    });
}

function getCards(_req, res, next) {
  Card.find()
    .then((cards) => {
      res.status(200).send(cards);
    })
    .catch(next);
}

function deletCard(req, res, next) {
  const { cardId } = req.params;

  const userId = req.user._id;

  Card.findById(cardId)
    .orFail(new NotFoundError('Пользователь с указанным id не существует'))
    .then((card) => {
      if (card.owner.equals(userId)) {
        Card.findByIdAndRemove(cardId);
        res.status(200).send({ message: 'Карта удалена успешно' });
        return;
      }
      throw new Forbidden('Доступ запрещен!');
    })
    .catch((err) => {
      if (err.message === 'NotCard') {
        next(new NotFoundError('Такой карты нет в базе данных'));
        return;
      } if (err.name === 'CastError') {
        next(new ValidationError('Невалидный id'));
        return;
      }
      next(err);
    });
}

function likeCard(req, res, next) {
  const { cardId } = req.params;

  Card.findByIdAndUpdate(cardId, { $addToSet: { likes: req.user._id } }, { new: true })
    .orFail(new Error('NotCard'))
    .then((card) => { res.status(200).send(card); })
    .catch((err) => {
      if (err.message === 'NotCard') {
        next(new NotFoundError('Такой карты нет в базе данных'));
      } else if (err.name === 'CastError') {
        next(new ValidationError('Невалидный id'));
      } else {
        next(err);
      }
    });
}

function dislikeCard(req, res, next) {
  const { cardId } = req.params;

  Card.findByIdAndUpdate(cardId, { $pull: { likes: req.user._id } }, { new: true })
    .orFail(new NotFoundError('Пользователь с указанным id не существует'))
    .then((card) => { res.status(200).send(card); })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new ValidationError('Невалидный id'));
      } else {
        next(err);
      }
    });
}

module.exports = {
  createCard,
  getCards,
  deletCard,
  likeCard,
  dislikeCard,
};
