const router = require('express').Router();

const {
  createCard, getCards, deletCard, likeCard, dislikeCard,
} = require('../controllers/cards');

router.post('/', createCard);

router.get('/', getCards);

router.delete('/:cardId', deletCard);

router.put('/:cardId/likes', likeCard);

router.delete('/:cardId/likes', dislikeCard);

module.exports.cardRouter = router;
