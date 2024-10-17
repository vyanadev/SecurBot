const { SlashCommandBuilder, EmbedBuilder, version } = require('discord.js');
const moment = require('moment');
const os = require('os');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('botinfo')
        .setDescription("Affiche les informations du bot"),
        cooldowns: 5,
    async execute(client, interaction, color) {

        const embed = new EmbedBuilder()
            .setTitle(`Informations sur ${client.user.username}`)
            .setThumbnail(client.user.displayAvatarURL())
            .addFields(
                { name: 'ID', value: client.user.id },
                { name: 'Créé le', value: moment(client.user.createdAt).format('DD/MM/YYYY HH:mm:ss') },
                { name: 'Développeur', value: `<@${process.env.OWNER_IDS}>` },
                { name: 'Serveurs', value: `${client.guilds.cache.size}` },
                { name: 'Utilisateurs', value: `${client.users.cache.size}` },
                { name: 'Version Discord.js', value: `v${version}` },
                { name: 'Version Node.js', value: process.version },
                { name: 'Utilisation mémoire', value: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB` },
                { name: 'Uptime', value: `${Math.floor(client.uptime / 86400000)}j ${Math.floor(client.uptime / 3600000) % 24}h ${Math.floor(client.uptime / 60000) % 60}m ${Math.floor(client.uptime / 1000) % 60}s` },
                { name: 'OS', value: `${os.type()} ${os.release()}` }
            )
            .setColor(color)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};