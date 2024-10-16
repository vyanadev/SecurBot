const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'ping',
    description: "Vérifie la latence du bot",
    aliases: ["latence"],
    cooldowns: 5,
    execute: async (client, message, args, prefix, color) => {
        try {
            const [ownerResult] = await client.db.promise().query('SELECT * FROM bot_owners WHERE user_id = ?', [message.author.id]);
            if (ownerResult.length === 0) return;

            const embed = new EmbedBuilder()
                .addFields(
                    { name: "Ping", value: "Calcul en cours", inline: true },
                    { name: "Latence", value: `${client.ws.ping}ms`, inline: true }
                )
                .setColor(process.env.DEFAULT_COLOR);

            const msg = await message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });

            const ping = msg.createdTimestamp - message.createdTimestamp;

            const embed2 = new EmbedBuilder()
                .addFields(
                    { name: "Ping", value: `${ping}ms`, inline: true },
                    { name: "Latence", value: `${client.ws.ping}ms`, inline: true }
                )
                .setColor(process.env.DEFAULT_COLOR);

            return msg.edit({ embeds: [embed2] });
        } catch (error) {
            console.error("Erreur dans la commande ping:", error);
            message.reply("Une erreur s'est produite lors de l'exécution de la commande.").catch(console.error);
        }
    }
};