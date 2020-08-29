const bcryptjs = require('bcryptjs');

const encryptPassword = async (pass) => {
  const salt = await bcryptjs.genSalt(10);
  const hash = await bcryptjs.hash(pass, salt);
  return hash;
};

const decryptPassword = async (stored, pass) => {
  const decrypted = await bcryptjs.compare(pass, stored);
  return decrypted;
};

module.exports = {
  encryptPassword,
  decryptPassword,
};
