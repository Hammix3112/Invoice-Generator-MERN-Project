const mongoose = require('mongoose');
// const mongoUri = 'mongodb://localhost:27017/inotebook';
const mongoUri = 'mongodb+srv://hh0449901:M0INaldfBDXXno9f@cluster0.dijsedi.mongodb.net/iNoteBook';

const connectToMongo = async () => {
    try {
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB successfully');
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
    }
}

module.exports = connectToMongo;
