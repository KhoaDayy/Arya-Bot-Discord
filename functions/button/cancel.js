module.exports = {
    data: {
        name: "cancel",
        type: "button",
    },

    execute: async (interaction) => {
    interaction.message.delete().catch(e => {})
    return;
    }
}