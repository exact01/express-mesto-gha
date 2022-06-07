const cors = require('cors');

const corsOptions = {
  origin: 'http://cohort37.nomoredomains.xyz',
};
   
module.exports = cors(corsOptions);
