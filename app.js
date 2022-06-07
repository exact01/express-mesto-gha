const express = require('express');
const { errors, celebrate, Joi } = require('celebrate');
const mongoose = require('mongoose');
const { userRouter } = require('./routes/users');
const { cardRouter } = require('./routes/cards');
const { createUser, login } = require('./controllers/users');
const { isAuthorized } = require('./middlewares/auth');
const NotFoundError = require('./errors/NotFoundError');
const { validateUrl } = require('./utils/customValidator');
const cors = require('cors');

const { PORT = 3000 } = process.env;
const app = express();
app.use(cors({ origin: 'http://cohort37.nomoredomains.xyz' }));
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
});

app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email({ tlds: { allow: false } }),
    password: Joi.string().required(),
  }).unknown(false),
}), login);
app.post('/signup', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email({ tlds: { allow: false } }),
    password: Joi.string().required(),
    about: Joi.string().min(2).max(30),
    name: Joi.string().min(2).max(30),
    avatar: Joi.string().custom(validateUrl, 'custom validate url'),
  }).unknown(false),
}), createUser);

app.use('/users', isAuthorized, userRouter);
app.use('/cards', isAuthorized, cardRouter);

app.use(isAuthorized, (_req, _res, next) => next(new NotFoundError('Страница не найдена')));

app.use(errors());

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  const { statusCode = 500, message } = err;

  res
    .status(statusCode)
    .send({ message: statusCode === 500 ? 'На сервере произошла ошибка' : message });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log('Server has been started');
});
