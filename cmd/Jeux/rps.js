const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'rps',
    description: "Joue à pierre-papier-ciseaux contre le bot",
    usage: "<pierre|papier|ciseaux>",
    aliases: ["ppc"],
    cooldowns: 3,
    execute: async (client, message, args, prefix, color) => {
        const choices = ['pierre', 'papier', 'ciseaux'];
        const userChoice = args[0]?.toLowerCase();

        if (!choices.includes(userChoice)) {
            return message.reply("Veuillez choisir entre pierre, papier ou ciseaux !");
        }

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
            .setColor(color);

        await message.reply({ embeds: [embed] });
    }
};