const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'warnlist',
    description: "Afficher la liste des avertissements d'un utilisateur",
    usage: "<@utilisateur>",
    aliases: ["avertissements"],
    cooldowns: 5,
    execute: async (client, message, args, prefix, color) => {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return message.reply("Vous n'avez pas la permission de voir les avertissements.");
        }

        const user = message.mentions.users.first() || message.author;

        try {
            const [warnings] = await client.db.promise().query(
                'SELECT * FROM warnings WHERE guild_id = ? AND user_id = ? ORDER BY timestamp DESC',
                [message.guild.id, user.id]
            );

            if (warnings.length === 0) {
                return message.reply(`${user.tag} n'a aucun avertissement.`);
            }

            const embed = new EmbedBuilder()
                .setTitle(`Avertissements de ${user.tag}`)
                .setColor(color)
                .setTimestamp();

            warnings.forEach((warn, index) => {
                embed.addFields({
                    name: `Avertissement ${index + 1} (ID: ${warn.id})`,
                    value: `Raison: ${warn.reason}\nModérateur: <@${warn.moderator_id}>\nDate: ${warn.timestamp}`
                });
            });

            await message.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await message.reply("Une erreur s'est produite lors de la récupération des avertissements.");
        }
    }
};