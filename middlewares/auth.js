const { JWT_SECRET_KEY } = process.env;
const jwt = require('jsonwebtoken');
const AuthError = require('../errors/AuthError');

function isAuthorized(req, _res, next) {
  const auth = req.headers.authorization;

  if (!auth) {
    next(new AuthError('Требуется авторизация'));
    return;
  }

  const token = auth.replace('Bearer ', '');

  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET_KEY);
    req.user = payload;
    next();
  } catch (e) {
    next(new AuthError('Требуется авторизация'));
  }
}

module.exports = {
  isAuthorized,
};
