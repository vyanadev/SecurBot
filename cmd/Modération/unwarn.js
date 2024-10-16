const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'unwarn',
    description: "Retirer un avertissement d'un utilisateur",
    usage: "<@utilisateur> <ID de l'avertissement>",
    aliases: ["retireravertissement"],
    cooldowns: 5,
    execute: async (client, message, args, prefix, color) => {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return message.reply("Vous n'avez pas la permission de retirer des avertissements.");
        }

        const user = message.mentions.users.first();
        if (!user) return message.reply("Veuillez mentionner un utilisateur.");

        const warnId = args[1];
        if (!warnId) return message.reply("Veuillez fournir l'ID de l'avertissement à retirer.");

        try {
            const [result] = await client.db.promise().query(
                'DELETE FROM warnings WHERE id = ? AND guild_id = ? AND user_id = ?',
                [warnId, message.guild.id, user.id]
            );

            if (result.affectedRows === 0) {
                return message.reply("Aucun avertissement trouvé avec cet ID pour cet utilisateur.");
            }

            const embed = new EmbedBuilder()
                .setTitle('Avertissement retiré')
                .setDescription(`Un avertissement a été retiré pour ${user.tag}.`)
                .addFields(
                    { name: 'ID de l\'avertissement', value: warnId },
                    { name: 'Modérateur', value: message.author.tag }
                )
                .setColor(color)
                .setTimestamp();

            await message.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await message.reply("Une erreur s'est produite lors du retrait de l'avertissement.");
        }
    }
};