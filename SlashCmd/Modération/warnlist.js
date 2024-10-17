const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warnlist')
        .setDescription("Afficher la liste des avertissements d'un utilisateur")
        .addUserOption(option => 
            option.setName('utilisateur')
                .setDescription('L\'utilisateur dont vous voulez voir les avertissements')
                .setRequired(false)),
                cooldowns: 5,
    async execute(client, interaction, color) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return interaction.reply({ content: "Vous n'avez pas la permission de voir les avertissements.", ephemeral: true });
        }

        const user = interaction.options.getUser('utilisateur') || interaction.user;

        try {
            const [warnings] = await interaction.client.db.promise().query(
                'SELECT * FROM warnings WHERE guild_id = ? AND user_id = ? ORDER BY timestamp DESC',
                [interaction.guild.id, user.id]
            );

            if (warnings.length === 0) {
                return interaction.reply(`${user.tag} n'a aucun avertissement.`);
            }

            const embed = new EmbedBuilder()
                .setTitle(`Avertissements de ${user.tag}`)
                .setColor(process.env.DEFAULT_COLOR)
                .setTimestamp();

            warnings.forEach((warn, index) => {
                embed.addFields({
                    name: `Avertissement ${index + 1} (ID: ${warn.id})`,
                    value: `Raison: ${warn.reason}\nModérateur: <@${warn.moderator_id}>\nDate: ${warn.timestamp}`
                });
            });

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: "Une erreur s'est produite lors de la récupération des avertissements.", ephemeral: true });
        }
    }
};