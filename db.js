const mongoose = require('mongoose');
const mongoUri = 'mongodb://localhost:27017/inotebook';

const connectToMongo = async () => {
    try {
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB successfully');
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
    }
}

module.exports = connectToMongo;
