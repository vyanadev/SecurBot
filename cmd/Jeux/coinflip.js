const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'coinflip',
    description: "Lance une pièce",
    usage: "",
    aliases: ["cf", "flip"],
    cooldowns: 3,
    execute: async (client, message, args, prefix, color) => {
        const result = Math.random() < 0.5 ? "Pile" : "Face";

        const embed = new EmbedBuilder()
            .setTitle("Lancer de pièce")
            .setDescription(`La pièce tombe sur... **${result}** !`)
            .setColor(color);

        await message.reply({ embeds: [embed] });
    }
};