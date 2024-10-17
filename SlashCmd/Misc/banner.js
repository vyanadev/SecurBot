const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('banner')
        .setDescription("Affiche la bannière d'un utilisateur")
        .addUserOption(option => 
            option.setName('utilisateur')
                .setDescription("L'utilisateur dont vous voulez voir la bannière")
                .setRequired(false)),
                cooldowns: 5,
        async execute(client, interaction, color) {
        const user = interaction.options.getUser('utilisateur') || interaction.user;

        try {
            const fetchedUser = await client.users.fetch(user.id, { force: true });
            if (!fetchedUser.banner) {
                return interaction.reply({ content: "Cet utilisateur n'a pas de bannière.", ephemeral: true });
            }

            const bannerUrl = fetchedUser.bannerURL({ dynamic: true, size: 4096 });

            const embed = new EmbedBuilder()
                .setTitle(`Bannière de ${fetchedUser.tag}`)
                .setImage(bannerUrl)
                .setColor(color)
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: "Une erreur s'est produite lors de la récupération de la bannière.", ephemeral: true });
        }
    }
};