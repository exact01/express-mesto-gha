const isUrl = require('validator/lib/isURL');

function validateUrl(value) {
  if (!isUrl(value, { require_protocol: true })) {
    throw new Error('is not a link');
  }
  return value;
}

module.exports = {
  validateUrl,
};
