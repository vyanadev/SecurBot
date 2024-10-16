const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'ban',
    description: "Bannir un membre du serveur",
    usage: "<@utilisateur> [raison]",
    aliases: ["bannir"],
    cooldowns: 5,
    execute: async (client, message, args, prefix, color) => {

        if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers) &&
            !message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply("Vous n'avez pas la permission de bannir des membres.");
        }

        if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return message.reply("Je n'ai pas la permission de bannir des membres.");
        }

        const user = message.mentions.users.first() || await client.users.fetch(args[0]).catch(() => null);
        if (!user) {
            return message.reply("Veuillez mentionner un utilisateur ou fournir un ID valide.");
        }

        const member = message.guild.members.cache.get(user.id);
        if (member) {
            if (member.roles.highest.position >= message.member.roles.highest.position && message.author.id !== message.guild.ownerId) {
                return message.reply("Vous ne pouvez pas bannir ce membre car son rôle est supérieur ou égal au vôtre.");
            }
            if (member.roles.highest.position >= message.guild.members.me.roles.highest.position) {
                return message.reply("Je ne peux pas bannir ce membre car son rôle est supérieur ou égal au mien.");
            }
        }

        const reason = args.slice(1).join(' ') || 'Aucune raison fournie';

        try {
            await message.guild.members.ban(user, { reason });
            const embed = new EmbedBuilder()
                .setTitle('Membre banni')
                .setDescription(`${user.tag} a été banni du serveur.`)
                .addFields({ name: 'Raison', value: reason })
                .setColor(color)
                .setTimestamp();
            await message.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await message.reply("Une erreur s'est produite lors du bannissement.");
        }
    }
};