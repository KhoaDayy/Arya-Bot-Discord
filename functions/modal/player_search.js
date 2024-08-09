const { ModalSubmitInteraction, ModalBuilder } = require("discord.js");

module.exports.data = {
    name: "search-modal",
    type: "modal",
}

/**
 * @param { ModalSubmitInteraction } interaction
 */
module.exports.execute = async (interaction) => {
    const { guild, client, fields } = interaction;
    const query = fields.getTextInputValue("search-input");
    const command = client.functions.get("search");
    await command.execute(interaction, query);

}