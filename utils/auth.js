const User = require('../models/User');

const userExist = async (email) => {
    const userData = await User.findOne({ email });
    if(userData) {
        return userData;
    } else {
        return false;
    }
};

const doLogin = () => {
    return;
};

module.exports = {
    userExist,
    doLogin,
};