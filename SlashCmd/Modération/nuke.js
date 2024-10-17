const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nuke')
        .setDescription('Recrée le canal actuel'),
        cooldowns: 5,
    async execute(client, interaction, color) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return interaction.reply({ content: "Vous n'avez pas la permission de gérer les canaux.", ephemeral: true });
        }

        try {
            await interaction.deferReply({ ephemeral: true });

            const channel = interaction.channel;
            const position = channel.position;
            const newChannel = await channel.clone();
            await channel.delete();
            await newChannel.setPosition(position);

            await newChannel.send("Ce canal a été recréé.");
            
            // Envoyer une réponse à l'utilisateur dans le nouveau canal
            await newChannel.send({ content: `Canal recréé par ${interaction.user.tag}`, ephemeral: true });
        } catch (error) {
            console.error(error);
            if (interaction.deferred) {
                await interaction.editReply({ content: "Une erreur s'est produite lors de la recréation du canal.", ephemeral: true });
            } else {
                await interaction.reply({ content: "Une erreur s'est produite lors de la recréation du canal.", ephemeral: true });
            }
        }
    }
};