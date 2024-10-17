const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const moment = require('moment');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription("Affiche les informations du serveur"),
        cooldowns: 5,
        async execute(client, interaction, color) {
        const guild = interaction.guild;

        const embed = new EmbedBuilder()
            .setTitle(`Informations sur ${guild.name}`)
            .setThumbnail(guild.iconURL({ dynamic: true }))
            .addFields(
                { name: 'ID', value: guild.id },
                { name: 'Propriétaire', value: `<@${guild.ownerId}>` },
                { name: 'Créé le', value: moment(guild.createdAt).format('DD/MM/YYYY HH:mm:ss') },
                { name: 'Membres', value: `${guild.memberCount} (🧑 ${guild.members.cache.filter(m => !m.user.bot).size} | 🤖 ${guild.members.cache.filter(m => m.user.bot).size})` },
                { name: 'Salons', value: `${guild.channels.cache.size} (📝 ${guild.channels.cache.filter(c => c.type === 0).size} | 🔊 ${guild.channels.cache.filter(c => c.type === 2).size})` },
                { name: 'Rôles', value: `${guild.roles.cache.size}` },
                { name: 'Niveau de boost', value: `${guild.premiumTier}` }
            )
            .setColor(color)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};