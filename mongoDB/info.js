const {Schema, model} = require('mongoose')

const infoseverSchema = new Schema({
    guildID: {
        type: String,
        required: true,
    },
    countID: {
        TotalID: String,
        MemberID: String,
        BotID: String
      },
});

module.exports = model('InfoSever', infoseverSchema)