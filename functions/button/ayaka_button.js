module.exports = {
    data: {
        name: "ayaka_button",
        type: "button",
    },

    execute: async (interaction) => {
        const ayaka = interaction.client.functions.get("ayaka");
        if (!ayaka) return;
        await ayaka.execute(interaction)
    }
}