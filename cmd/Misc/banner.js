const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'banner',
    description: "Affiche la bannière d'un utilisateur",
    usage: "[@utilisateur]",
    aliases: ["bannière"],
    cooldowns: 5,
    execute: async (client, message, args, prefix, color) => {
        const user = message.mentions.users.first() || message.author;

        try {
            const fetchedUser = await client.users.fetch(user.id, { force: true });
            if (!fetchedUser.banner) {
                return message.reply("Cet utilisateur n'a pas de bannière.");
            }

            const bannerUrl = fetchedUser.bannerURL({ dynamic: true, size: 4096 });

            const embed = new EmbedBuilder()
                .setTitle(`Bannière de ${fetchedUser.tag}`)
                .setImage(bannerUrl)
                .setColor(color)
                .setTimestamp();

            await message.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await message.reply("Une erreur s'est produite lors de la récupération de la bannière.");
        }
    }
};