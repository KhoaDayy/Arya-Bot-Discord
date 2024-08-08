require('dotenv').config();
const mongoose = require('mongoose'); // Ensure mongoose is required

module.exports = async () => {
    mongoose.set('strictQuery', false);

    try {
        await mongoose.connect(process.env.MONGODB);
        console.log('Đã kết nối tới database!');
    } catch (error) {
        console.error('Lỗi khi kết nối tới database:', error);
    }
};
