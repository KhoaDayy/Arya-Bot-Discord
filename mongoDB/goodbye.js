const mongoose = require('mongoose');

const goodbyeSchema = new mongoose.Schema({
    guildID: {
        type: String,
        required: true,
        unique: true
    },
    goodbyeMessage: {
        title: { type: String, default: '' },
        subtitle: { type: String, default: '' },
        description: { type: String, default: '' },
        image: { type: String, default: '' },
    },
    useEmbed: {
        type: Boolean,
        default: false
    },
    channelID: {
        type: String,
        required: true,
    }
});

module.exports = mongoose.model('goodbye', goodbyeSchema);