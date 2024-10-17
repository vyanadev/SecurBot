const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('8ball')
        .setDescription("Pose une question à la boule magique")
        .addStringOption(option => 
            option.setName('question')
                .setDescription('La question à poser à la boule magique')
                .setRequired(true)),
                cooldowns: 3,
    async execute(client, interaction, color) {
        const question = interaction.options.getString('question');

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
                { name: "Question", value: question },
                { name: "Réponse", value: response }
            )
            .setColor(process.env.DEFAULT_COLOR);

        await interaction.reply({ embeds: [embed] });
    }
};