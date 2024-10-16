const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'warn',
    description: "Avertir un utilisateur",
    usage: "<@utilisateur> <raison>",
    aliases: ["avertir"],
    cooldowns: 5,
    execute: async (client, message, args, prefix, color) => {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return message.reply("Vous n'avez pas la permission d'avertir des membres.");
        }

        const user = message.mentions.users.first();
        if (!user) return message.reply("Veuillez mentionner un utilisateur à avertir.");

        const reason = args.slice(1).join(' ');
        if (!reason) return message.reply("Veuillez fournir une raison pour l'avertissement.");

        try {
            await client.db.promise().query(
                'INSERT INTO warnings (guild_id, user_id, moderator_id, reason) VALUES (?, ?, ?, ?)',
                [message.guild.id, user.id, message.author.id, reason]
            );

            const embed = new EmbedBuilder()
                .setTitle('Avertissement')
                .setDescription(`${user.tag} a été averti.`)
                .addFields(
                    { name: 'Raison', value: reason },
                    { name: 'Modérateur', value: message.author.tag }
                )
                .setColor(color)
                .setTimestamp();

            await message.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await message.reply("Une erreur s'est produite lors de l'ajout de l'avertissement.");
        }
    }
};