const { errors, celebrate, Joi } = require('celebrate');
const router = require('express').Router();
const { validateUrl } = require('../utils/customValidator');

const {
  getUser, getUsers, updateProfile, updateAvatar, getUserMe,
} = require('../controllers/users');

router.get('/me', getUserMe);

router.get('/:userId', celebrate({
  params: Joi.object().keys({
    userId: Joi.string().required().length(24),
  }).unknown(false),
}), getUser);

router.get('/', getUsers);

router.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30).required(),
    about: Joi.string().min(2).max(30).required(),
  }).unknown(false),
}), updateProfile);

router.patch('/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().required().custom(validateUrl, 'custom validate url'),
  }).unknown(false),
}), updateAvatar);

router.use(errors());

module.exports.userRouter = router;
