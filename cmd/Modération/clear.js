const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'clear',
    description: "Supprimer un certain nombre de messages dans le canal",
    usage: "<nombre de messages>",
    aliases: ["purge", "nettoyage"],
    cooldowns: 5,
    execute: async (client, message, args, prefix, color) => {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages) &&
            !message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply("Vous n'avez pas la permission de gérer les messages.");
        }

        if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return message.reply("Je n'ai pas la permission de gérer les messages.");
        }

        const amount = parseInt(args[0]);
        if (isNaN(amount) || amount <= 0 || amount > 100) {
            return message.reply("Veuillez fournir un nombre valide entre 1 et 100.");
        }

        try {
            const messages = await message.channel.bulkDelete(amount, true);
            const embed = new EmbedBuilder()
                .setTitle('Messages supprimés')
                .setDescription(`${messages.size} messages ont été supprimés.`)
                .setColor(color)
                .setTimestamp();
            await message.channel.send({ embeds: [embed] }).then(msg => {
                setTimeout(() => msg.delete(), 5000);
            });
        } catch (error) {
            console.error(error);
            await message.reply("Une erreur s'est produite lors de la suppression des messages. Assurez-vous que les messages ne datent pas de plus de 14 jours.");
        }
    }
};