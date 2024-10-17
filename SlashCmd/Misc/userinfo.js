const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const moment = require('moment');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription("Affiche les informations d'un utilisateur")
        .addUserOption(option => 
            option.setName('utilisateur')
                .setDescription("L'utilisateur dont vous voulez voir les informations")
                .setRequired(false)),
                cooldowns: 5,
    async execute(client, interaction, color) {
        const user = interaction.options.getUser('utilisateur') || interaction.user;
        const member = await interaction.guild.members.fetch(user.id);

        const embed = new EmbedBuilder()
            .setTitle(`Informations sur ${user.tag}`)
            .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
            .addFields(
                { name: 'ID', value: user.id },
                { name: 'Compte créé le', value: moment(user.createdAt).format('DD/MM/YYYY HH:mm:ss') },
                { name: 'A rejoint le serveur le', value: moment(member.joinedAt).format('DD/MM/YYYY HH:mm:ss') },
                { name: 'Rôles', value: member.roles.cache.map(role => role.toString()).join(', ') },
                { name: 'Est un bot', value: user.bot ? 'Oui' : 'Non' },
                { name: 'Statut', value: member.presence ? member.presence.status : 'Hors ligne' },
                { name: 'Activité', value: member.presence?.activities[0]?.name || 'Aucune' }
            )
            .setColor(color)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};