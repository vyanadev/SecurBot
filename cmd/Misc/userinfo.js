const { EmbedBuilder } = require('discord.js');
const moment = require('moment');

module.exports = {
    name: 'userinfo',
    description: "Affiche les informations d'un utilisateur",
    usage: "[@utilisateur]",
    aliases: ["ui", "user"],
    cooldowns: 5,
    execute: async (client, message, args, prefix, color) => {
        const user = message.mentions.users.first() || message.author;
        const member = message.guild.members.cache.get(user.id);

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

        await message.reply({ embeds: [embed] });
    }
};