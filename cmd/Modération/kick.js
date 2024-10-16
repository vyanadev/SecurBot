const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'kick',
    description: "Expulser un membre du serveur",
    usage: "<@utilisateur> [raison]",
    aliases: ["expulser"],
    cooldowns: 5,
    execute: async (client, message, args, prefix, color) => {
        // Vérifications de permissions
        if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers) &&
            !message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply("Vous n'avez pas la permission d'expulser des membres.");
        }

        if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.KickMembers)) {
            return message.reply("Je n'ai pas la permission d'expulser des membres.");
        }

        const member = message.mentions.members.first() || await message.guild.members.fetch(args[0]).catch(() => null);
        if (!member) {
            return message.reply("Veuillez mentionner un membre ou fournir un ID valide.");
        }

        if (member.roles.highest.position >= message.member.roles.highest.position && message.author.id !== message.guild.ownerId) {
            return message.reply("Vous ne pouvez pas expulser ce membre car son rôle est supérieur ou égal au vôtre.");
        }

        if (member.roles.highest.position >= message.guild.members.me.roles.highest.position) {
            return message.reply("Je ne peux pas expulser ce membre car son rôle est supérieur ou égal au mien.");
        }

        if (!member.kickable) {
            return message.reply("Je ne peux pas expulser ce membre.");
        }

        const reason = args.slice(1).join(' ') || 'Aucune raison fournie';

        try {
            await member.kick(reason);
            const embed = new EmbedBuilder()
                .setTitle('Membre expulsé')
                .setDescription(`${member.user.tag} a été expulsé du serveur.`)
                .addFields({ name: 'Raison', value: reason })
                .setColor(color)
                .setTimestamp();
            await message.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await message.reply("Une erreur s'est produite lors de l'expulsion.");
        }
    }
};