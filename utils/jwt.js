const { JWT_SECRET_KEY } = process.env;
const jwt = require('jsonwebtoken');

function generateToken(payload) {
  return jwt.sign({ _id: payload }, JWT_SECRET_KEY, { expiresIn: '7d' });
}

module.exports = {
  generateToken,
};
