const { EmbedBuilder } = require('discord.js');

module.exports = async (client, guild) => {
    console.log(`Le bot a rejoint un nouveau serveur : ${guild.name} (id: ${guild.id}). Ce serveur a ${guild.memberCount} membres!`);

    const embed = new EmbedBuilder()
        .setTitle('\`🎉\` Nouveau serveur rejoint')
        .setColor('#00FF00')
        .setThumbnail(guild.iconURL({ dynamic: true, size: 1024 }))
        .addFields(
            { name: '\`📋\` Nom du serveur', value: guild.name, inline: true },
            { name: '\`🆔\` ID du serveur', value: guild.id, inline: true },
            { name: '\`👥\` Nombre de membres', value: guild.memberCount.toString(), inline: true },
            { name: '\`👑\` Propriétaire', value: `<@${guild.ownerId}>`, inline: true },
            { name: '\`🌍\` Région', value: guild.preferredLocale, inline: true },
            { name: '\`📅\` Créé le', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`, inline: false },
            { name: '\`🤖\` Nombre total de bots', value: `${client.guilds.cache.size}`, inline: true },
            { name: '\`👤\` Nombre total d\'utilisateurs', value: `${client.users.cache.size}`, inline: true }
        )
        .setTimestamp()
        .setFooter({ text: `Cobalt est maintenant dans ${client.guilds.cache.size} serveurs!` });

    // Envoyer le log dans le canal spécifié
    const logChannel = client.channels.cache.get('1155540778903421039');
    if (logChannel) {
        try {
            await logChannel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Erreur lors de l\'envoi du log:', error);
        }
    }

    try {
        const channel = guild.channels.cache.find(channel => channel.type === 0 && channel.permissionsFor(guild.members.me).has('SendMessages'));
        if (channel) {
            const welcomeEmbed = new EmbedBuilder()
                .setTitle('\`👋\` Merci de m\'avoir ajouté!')
                .setDescription(`Je suis Cobalt, un bot polyvalent conçu pour améliorer votre expérience Discord. Utilisez \`!help\` pour voir la liste de mes commandes.`)
                .setColor('#0099ff')
                .addFields(
                    { name: '\`🛡️\` Sécurité', value: 'Protection contre les raids, anti-spam, et plus encore.' },
                    { name: '\`🔨\` Modération', value: 'Outils avancés pour gérer votre serveur efficacement.' },
                    { name: '\`🎉\` Fun', value: 'Commandes amusantes pour engager votre communauté.' },
                )
                .setFooter({ text: 'Pour plus d\'aide, rejoignez notre serveur de support!' });
            await channel.send({ embeds: [welcomeEmbed] });
        }
    } catch (error) {
        console.error('Erreur lors de l\'envoi du message de bienvenue:', error);
    }
};