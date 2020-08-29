const User = require('../models/User');

const userExist = async (email) => {
  const userData = await User.findOne({ email });
  if (userData) {
    return userData;
  }
  return false;
};

const doLogin = () => {
  throw new Error('Method not implemented');
};

module.exports = {
  userExist,
  doLogin,
};
