const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Supprimer un certain nombre de messages dans le canal')
        .addIntegerOption(option => 
            option.setName('nombre')
                .setDescription('Le nombre de messages à supprimer (entre 1 et 100)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100)),
                cooldowns: 5,
    async execute(client, interaction, color) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages) &&
            !interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: "Vous n'avez pas la permission de gérer les messages.", ephemeral: true });
        }

        if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return interaction.reply({ content: "Je n'ai pas la permission de gérer les messages.", ephemeral: true });
        }

        const amount = interaction.options.getInteger('nombre');

        try {
            await interaction.deferReply({ ephemeral: true });
            const messages = await interaction.channel.bulkDelete(amount, true);
            const embed = new EmbedBuilder()
                .setTitle('Messages supprimés')
                .setDescription(`${messages.size} messages ont été supprimés.`)
                .setColor(process.env.DEFAULT_COLOR)
                .setTimestamp();
            await interaction.editReply({ embeds: [embed], ephemeral: true });

            const tempMessage = await interaction.channel.send({ embeds: [embed] });
            setTimeout(() => tempMessage.delete(), 5000);
        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: "Une erreur s'est produite lors de la suppression des messages. Assurez-vous que les messages ne datent pas de plus de 14 jours.", ephemeral: true });
        }
    }
};