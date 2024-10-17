const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rps')
        .setDescription("Joue à pierre-papier-ciseaux contre le bot")
        .addStringOption(option =>
            option.setName('choix')
                .setDescription('Choisissez pierre, papier ou ciseaux')
                .setRequired(true)
                .addChoices(
                    { name: 'Pierre', value: 'pierre' },
                    { name: 'Papier', value: 'papier' },
                    { name: 'Ciseaux', value: 'ciseaux' }
                )),
                cooldowns: 3,
    async execute(client, interaction, color) {
        const userChoice = interaction.options.getString('choix');
        const choices = ['pierre', 'papier', 'ciseaux'];
        const botChoice = choices[Math.floor(Math.random() * choices.length)];

        let result;
        if (userChoice === botChoice) {
            result = "Égalité !";
        } else if (
            (userChoice === 'pierre' && botChoice === 'ciseaux') ||
            (userChoice === 'papier' && botChoice === 'pierre') ||
            (userChoice === 'ciseaux' && botChoice === 'papier')
        ) {
            result = "Vous avez gagné !";
        } else {
            result = "Vous avez perdu !";
        }

        const embed = new EmbedBuilder()
            .setTitle("Pierre Papier Ciseaux")
            .addFields(
                { name: "Votre choix", value: userChoice },
                { name: "Choix du bot", value: botChoice },
                { name: "Résultat", value: result }
            )
            .setColor(process.env.DEFAULT_COLOR);

        await interaction.reply({ embeds: [embed] });
    }
};