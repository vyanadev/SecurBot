const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('slowmode')
        .setDescription('Définit le mode lent dans un canal')
        .addIntegerOption(option =>
            option.setName('durée')
                .setDescription('Durée du mode lent en secondes (0-21600)')
                .setRequired(true)
                .setMinValue(0)
                .setMaxValue(21600)),
                cooldowns: 5,
    async execute(client, interaction, color) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return interaction.reply({ content: "Vous n'avez pas la permission de gérer les canaux.", ephemeral: true });
        }

        const duration = interaction.options.getInteger('durée');

        try {
            await interaction.channel.setRateLimitPerUser(duration);
            
            let response;
            if (duration === 0) {
                response = "Le mode lent a été désactivé dans ce canal.";
            } else {
                response = `Le mode lent a été défini à ${duration} secondes dans ce canal.`;
            }
            
            await interaction.reply({ content: response });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: "Une erreur s'est produite lors de la définition du mode lent.", ephemeral: true });
        }
    }
};