const bcryptjs = require('bcryptjs');

const encryptPassword = async (pass) => {
    const salt = await bcryptjs.genSalt(10);
    return await bcryptjs.hash(pass, salt);
};

const decryptPassword = async (stored, pass) => {
    return await bcryptjs.compare(pass, stored);
};

module.exports = {
    encryptPassword,
    decryptPassword
};