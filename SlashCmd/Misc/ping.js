const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription("Vérifie la latence du bot"),
        cooldowns: 5,
    async execute(client, interaction, color) {
        try {
            const embed = new EmbedBuilder()
                .addFields(
                    { name: "Ping", value: "Calcul en cours", inline: true },
                    { name: "Latence", value: `${client.ws.ping}ms`, inline: true }
                )
                .setColor(process.env.DEFAULT_COLOR);

            const sent = await interaction.reply({ embeds: [embed], fetchReply: true });

            const ping = sent.createdTimestamp - interaction.createdTimestamp;

            const embed2 = new EmbedBuilder()
                .addFields(
                    { name: "Ping", value: `${ping}ms`, inline: true },
                    { name: "Latence", value: `${client.ws.ping}ms`, inline: true }
                )
                .setColor(process.env.DEFAULT_COLOR);

            await interaction.editReply({ embeds: [embed2] });
        } catch (error) {
            console.error("Erreur dans la commande ping:", error);
            await interaction.reply({ content: "Une erreur s'est produite lors de l'exécution de la commande.", ephemeral: true });
        }
    }
};