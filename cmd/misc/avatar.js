const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'avatar',
    description: "Affiche l'avatar d'un utilisateur",
    usage: "[@utilisateur]",
    aliases: ["pfp", "pp"],
    cooldowns: 5,
    execute: async (client, message, args, prefix, color) => {
        const user = message.mentions.users.first() || message.author;

        const embed = new EmbedBuilder()
            .setTitle(`Avatar de ${user.tag}`)
            .setImage(user.displayAvatarURL({ dynamic: true, size: 4096 }))
            .setColor(color)
            .setTimestamp();

        await message.reply({ embeds: [embed] });
    }
};