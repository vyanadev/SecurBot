const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription("Affiche l'avatar d'un utilisateur")
        .addUserOption(option => 
            option.setName('utilisateur')
                .setDescription("L'utilisateur dont vous voulez voir l'avatar")
                .setRequired(false)),
                cooldowns: 5,
        async execute(client, interaction, color) {
        const user = interaction.options.getUser('utilisateur') || interaction.user;

        const embed = new EmbedBuilder()
            .setTitle(`Avatar de ${user.tag}`)
            .setImage(user.displayAvatarURL({ dynamic: true, size: 4096 }))
            .setColor(color)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};