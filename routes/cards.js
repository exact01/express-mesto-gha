const { errors, celebrate, Joi } = require('celebrate');
const router = require('express').Router();
const { validateUrl } = require('../utils/customValidator');

const {
  createCard, getCards, deletCard, likeCard, dislikeCard,
} = require('../controllers/cards');

router.post('/', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    link: Joi.string().required().custom(validateUrl, 'custom validate url'),
  }).unknown(false),
}), createCard);

router.get('/', getCards);

router.delete('/:cardId', celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().required().length(24),
  }).unknown(false),
}), deletCard);

router.put('/:cardId/likes', celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().required().max(24).min(24),
  }).unknown(false),
}), likeCard);

router.delete('/:cardId/likes', celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().required().max(24).min(24),
  }).unknown(false),
}), dislikeCard);

router.use(errors());

module.exports.cardRouter = router;
