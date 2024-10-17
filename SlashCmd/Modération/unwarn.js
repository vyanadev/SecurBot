const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unwarn')
        .setDescription("Retirer un avertissement d'un utilisateur")
        .addUserOption(option => 
            option.setName('utilisateur')
                .setDescription("L'utilisateur dont retirer l'avertissement")
                .setRequired(true))
        .addStringOption(option => 
            option.setName('warnid')
                .setDescription("L'ID de l'avertissement à retirer")
                .setRequired(true)),
                cooldowns: 5,
    async execute(client, interaction, color) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return interaction.reply({ content: "Vous n'avez pas la permission de retirer des avertissements.", ephemeral: true });
        }

        const user = interaction.options.getUser('utilisateur');
        const warnId = interaction.options.getString('warnid');

        try {
            const [result] = await interaction.client.db.promise().query(
                'DELETE FROM warnings WHERE id = ? AND guild_id = ? AND user_id = ?',
                [warnId, interaction.guild.id, user.id]
            );

            if (result.affectedRows === 0) {
                return interaction.reply({ content: "Aucun avertissement trouvé avec cet ID pour cet utilisateur.", ephemeral: true });
            }

            const embed = new EmbedBuilder()
                .setTitle('Avertissement retiré')
                .setDescription(`Un avertissement a été retiré pour ${user.tag}.`)
                .addFields(
                    { name: 'ID de l\'avertissement', value: warnId },
                    { name: 'Modérateur', value: interaction.user.tag }
                )
                .setColor(process.env.DEFAULT_COLOR)
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: "Une erreur s'est produite lors du retrait de l'avertissement.", ephemeral: true });
        }
    }
};