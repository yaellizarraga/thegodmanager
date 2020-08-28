const mongoose = require('mongoose');

const MongoConnection = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, 
        { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });     
        console.log('DB connected');   
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

module.exports = MongoConnection;