const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: '8ball',
    description: "Pose une question à la boule magique",
    usage: "<question>",
    aliases: ["8b"],
    cooldowns: 3,
    execute: async (client, message, args, prefix, color) => {
        if (!args.length) return message.reply("Veuillez poser une question !");

        const responses = [
            "C'est certain.", "Sans aucun doute.", "Oui, définitivement.", "Vous pouvez compter dessus.",
            "Très probablement.", "Les perspectives sont bonnes.", "Oui.", "Les signes indiquent que oui.",
            "Réponse floue, essayez à nouveau.", "Redemandez plus tard.", "Mieux vaut ne pas vous le dire maintenant.",
            "Impossible de prédire maintenant.", "Concentrez-vous et redemandez.", "N'y comptez pas.",
            "Ma réponse est non.", "Mes sources disent non.", "Les perspectives ne sont pas si bonnes.", "Très douteux."
        ];

        const response = responses[Math.floor(Math.random() * responses.length)];

        const embed = new EmbedBuilder()
            .setTitle("🎱 La boule magique a parlé")
            .addFields(
                { name: "Question", value: args.join(" ") },
                { name: "Réponse", value: response }
            )
            .setColor(color);

        await message.reply({ embeds: [embed] });
    }
};