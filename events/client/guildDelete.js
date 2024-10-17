const { EmbedBuilder } = require('discord.js');

module.exports = async (client, guild) => {
    console.log(`Le bot a été retiré du serveur : ${guild.name} (id: ${guild.id})`);

    const embed = new EmbedBuilder()
        .setTitle('\`😢\` Serveur quitté')
        .setColor('#FF0000')
        .setThumbnail(guild.iconURL({ dynamic: true, size: 1024 }))
        .addFields(
            { name: '\`📋\` Nom du serveur', value: guild.name, inline: true },
            { name: '\`🆔\` ID du serveur', value: guild.id, inline: true },
            { name: '\`👥\` Nombre de membres', value: guild.memberCount.toString(), inline: true },
            { name: '\`👑\` Propriétaire', value: `<@${guild.ownerId}>`, inline: true },
            { name: '\`📅\` Rejoint le', value: `<t:${Math.floor(guild.joinedTimestamp / 1000)}:F>`, inline: false },
            { name: '\`⏱️\` Durée de présence', value: `${Math.floor((Date.now() - guild.joinedTimestamp) / 86400000)} jours`, inline: true },
            { name: '\`🤖\` Nombre total de bots', value: `${client.guilds.cache.size}`, inline: true },
            { name: '\`👤\` Nombre total d\'utilisateurs', value: `${client.users.cache.size}`, inline: true }
        )
        .setTimestamp()
        .setFooter({ text: `Cobalt est maintenant dans ${client.guilds.cache.size} serveurs.` });

    // Envoyer le log dans le canal spécifié
    const logChannel = client.channels.cache.get('1155540778903421039');
    if (logChannel) {
        try {
            await logChannel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Erreur lors de l\'envoi du log:', error);
        }
    }
};