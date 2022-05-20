const Card = require('../models/Сard');

function createCard(req, res) {
  const owner = req.user._id;

  const { name, link } = req.body;

  if (!name || !link || !owner) {
    res.status(400).send({ message: 'Переданы некоректные данные' });
    return;
  }

  Card.create({ name, link, owner })
    .then((card) => {
      res.status(200).send(card);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        const fields = Object.keys(err.errors).join(', ');
        return res.status(400).send({ message: `поле(я) '${fields}' введены некорректно` });
      }

      return res.status(500).send({ message: 'Произошла ошибка' });
    });
}

function getCards(req, res) {
  Card.find()
    .orFail(new Error('NotCards'))
    .then((cards) => {
      res.status(200).send(cards);
    })
    .catch((err) => {
      if (err.message === 'NotCards') {
        res.status(404).send({ message: 'Карт в базе данных нет' });
      } else {
        res.status(500).send({ message: 'Произошла ошибка' });
      }
    });
}

function deletCard(req, res) {
  const { cardId } = req.params;

  if (cardId.length !== 24) {
    res.status(400).send({ message: 'Некорректный айди карты' });
    return;
  }

  Card.findByIdAndRemove(req.params.cardId)
    .then((card) => {
      if (!card) {
        return res.status(404).send({ message: 'Запрашиваемая карточка не найдена' });
      }
      return res.send({ data: card });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(400).send({ message: 'id карточки некорректен' });
      }

      return res.status(500).send({ message: 'Произошла ошибка' });
    });
}

function likeCard(req, res) {
  const { cardId } = req.params;

  if (cardId.length !== 24) {
    res.status(400).send({ message: 'Не верно передан айди карты' });
    return;
  }

  Card.findByIdAndUpdate(cardId, { $addToSet: { likes: req.user._id } }, { new: true })
    .orFail(new Error('NotCard'))
    .then((card) => { res.status(200).send(card); })
    .catch((err) => {
      if (err.message === 'NotCard') {
        res.status(404).send({ message: 'Такой карты нет в базе данных' });
      } else {
        (
          res.status(500).send({ message: 'Произошла ошибка' })
        );
      }
    });
}

function dislikeCard(req, res) {
  const { cardId } = req.params;

  if (cardId.length !== 24) {
    res.status(400).send({ message: 'Не верно передан айди карты' });
    return;
  }

  Card.findByIdAndUpdate(cardId, { $pull: { likes: req.user._id } }, { new: true })
    .orFail(new Error('NotCard'))
    .then((card) => { res.status(200).send(card); })
    .catch((err) => {
      if (err.message === 'NotCard') {
        res.status(404).send({ message: 'Такой карты нет в базе данных' });
      } else {
        (
          res.status(500).send({ message: 'Произошла ошибка' })
        );
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
