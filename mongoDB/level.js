const {Schema, model} = require('mongoose')

const levelSchema = new Schema({
    userID: {
        type:String,
        required: true,
    },
    guildID: {
        type: String,
        required: true,
    },
    level: {
        type: Number,
        default: 0,
    },
    xp: {
        type: Number,
        default: 0,
    }
});

module.exports = model('Level', levelSchema)