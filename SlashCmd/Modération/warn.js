const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Avertir un utilisateur')
        .addUserOption(option => 
            option.setName('utilisateur')
                .setDescription('L\'utilisateur à avertir')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('raison')
                .setDescription('La raison de l\'avertissement')
                .setRequired(true)),
                cooldowns: 5,
    async execute(interaclient, interaction, colorction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return interaction.reply({ content: "Vous n'avez pas la permission d'avertir des membres.", ephemeral: true });
        }

        const user = interaction.options.getUser('utilisateur');
        const reason = interaction.options.getString('raison');

        try {
            await interaction.client.db.promise().query(
                'INSERT INTO warnings (guild_id, user_id, moderator_id, reason) VALUES (?, ?, ?, ?)',
                [interaction.guild.id, user.id, interaction.user.id, reason]
            );

            const embed = new EmbedBuilder()
                .setTitle('Avertissement')
                .setDescription(`${user.tag} a été averti.`)
                .addFields(
                    { name: 'Raison', value: reason },
                    { name: 'Modérateur', value: interaction.user.tag }
                )
                .setColor(process.env.DEFAULT_COLOR)
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: "Une erreur s'est produite lors de l'ajout de l'avertissement.", ephemeral: true });
        }
    }
};