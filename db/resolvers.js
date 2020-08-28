const User = require('../models/User');
const { encryptPassword, decryptPassword } = require('../utils/hash');
const { userExist } = require('../utils/auth');
const { createToken } = require('../utils/jwt');

const resolvers = {
    Query: {
        obtenerCurso: () => "Algo"
    },
    Mutation: {
        newUser: async (_, { input }) => {

            const { email, password } = input;

            // Validate if user is already registered
            const exist = await User.findOne({ email });
            if(exist) {
                throw new Error('The user is already registered');
            }

            input.password = await encryptPassword(password);

            try {
                const user = new User(input);
                user.save();
                return user;
            } catch (err) { 
                console.log(err);
            }
        },
        authUser: async (_, { input }) => {

            const { email, password } = input;
            const user = await userExist(email); 

            if(!user) {
                throw new Error('User not exist');
            }
            console.log(user);
            if(!await decryptPassword(user.password, password)) {
                throw new Error('Incorrect password');
            }

            return {
                token: createToken(user.id, process.env.JWT_SECRET, '24h')
            }

        },
    }
};

module.exports = resolvers;