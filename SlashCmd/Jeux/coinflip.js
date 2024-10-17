const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('coinflip')
        .setDescription("Lance une pièce"),
        cooldowns: 3,
    async execute(client, interaction, color) {
        const result = Math.random() < 0.5 ? "Pile" : "Face";

        const embed = new EmbedBuilder()
            .setTitle("Lancer de pièce")
            .setDescription(`La pièce tombe sur... **${result}** !`)
            .setColor(process.env.DEFAULT_COLOR);

        await interaction.reply({ embeds: [embed] });
    }
};