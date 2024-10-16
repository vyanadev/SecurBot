const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'mute',
    description: "Mettre un membre en sourdine",
    usage: "<@utilisateur> <durée en minutes> [raison]",
    aliases: ["timeout"],
    cooldowns: 5,
    execute: async (client, message, args, prefix, color) => {
        // Vérifications de permissions
        if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers) &&
            !message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply("Vous n'avez pas la permission de modérer les membres.");
        }

        if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return message.reply("Je n'ai pas la permission de modérer les membres.");
        }

        const member = message.mentions.members.first() || await message.guild.members.fetch(args[0]).catch(() => null);
        if (!member) {
            return message.reply("Veuillez mentionner un membre ou fournir un ID valide.");
        }

        if (member.roles.highest.position >= message.member.roles.highest.position && message.author.id !== message.guild.ownerId) {
            return message.reply("Vous ne pouvez pas mettre en sourdine ce membre car son rôle est supérieur ou égal au vôtre.");
        }

        if (member.roles.highest.position >= message.guild.members.me.roles.highest.position) {
            return message.reply("Je ne peux pas mettre en sourdine ce membre car son rôle est supérieur ou égal au mien.");
        }

        if (!member.moderatable) {
            return message.reply("Je ne peux pas mettre ce membre en sourdine.");
        }

        const duration = parseInt(args[1]);
        if (isNaN(duration) || duration <= 0 || duration > 40320) { // 40320 minutes = 28 jours, la limite maximale de Discord
            return message.reply("Veuillez fournir une durée valide en minutes (entre 1 et 40320).");
        }

        const reason = args.slice(2).join(' ') || 'Aucune raison fournie';

        try {
            await member.timeout(duration * 60 * 1000, reason);
            const embed = new EmbedBuilder()
                .setTitle('Membre mis en sourdine')
                .setDescription(`${member.user.tag} a été mis en sourdine pour ${duration} minutes.`)
                .addFields(
                    { name: 'Raison', value: reason },
                    { name: 'Durée', value: `${duration} minutes` }
                )
                .setColor(color)
                .setTimestamp();
            await message.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await message.reply("Une erreur s'est produite lors de la mise en sourdine.");
        }
    }
};