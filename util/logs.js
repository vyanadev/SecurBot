const { EmbedBuilder } = require("discord.js");

const logs = async (obj) => {
    const guild = obj.guild;
    if (!guild) return;

    const client = obj.client;

    // Récupérer l'ID du canal de logs et la couleur depuis la base de données
    const [logResults] = await client.db.promise().query('SELECT log_channel, color FROM guild_settings WHERE guild_id = ?', [guild.id]);
    const logChannelId = logResults[0]?.log_channel;
    const color = logResults[0]?.color || process.env.DEFAULT_COLOR;

    const logs = guild.channels.cache.get(logChannelId);
    if (!logs) return;

    const embed = new EmbedBuilder()
        .setTitle(`📰 ${obj.name}`)
        .addFields(
            { name: "Auteur:", value: `<@${obj.executor}>`, inline: true },
            { name: "Sanction:", value: `\`${obj.punish}\``, inline: true }
        )
        .setColor(color)
        .setTimestamp();

    if (obj.salon) embed.addFields({ name: "Salon:", value: `\`${obj.salon}\``, inline: true });
    if (obj.user) embed.addFields({ name: "Membre:", value: `<@${obj.user}>`, inline: true });
    if (obj.roles) embed.addFields({ name: "Rôles:", value: `<@&${obj.roles}>`, inline: true });
    if (obj.bot) embed.addFields({ name: "Bot:", value: `<@${obj.bot}>`, inline: true });
    if (obj.limit) embed.addFields({ name: "Limite:", value: `${obj.limit}`, inline: true });

    logs.send({ embeds: [embed] });
};

module.exports = logs;