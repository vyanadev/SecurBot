const { SlashCommandBuilder, PermissionsBitField, ChannelType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('voicemove')
        .setDescription("Déplace tous les membres d'un salon vocal vers un autre")
        .addChannelOption(option =>
            option.setName('source')
                .setDescription('Le salon vocal source')
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildVoice))
        .addChannelOption(option =>
            option.setName('destination')
                .setDescription('Le salon vocal de destination')
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildVoice)),
                cooldowns: 5,
    async execute(client, interaction, color) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.MoveMembers)) {
            return interaction.reply({ content: "Vous n'avez pas la permission de déplacer des membres.", ephemeral: true });
        }

        const sourceChannel = interaction.options.getChannel('source');
        const destChannel = interaction.options.getChannel('destination');

        if (!sourceChannel || !destChannel) {
            return interaction.reply({ content: "Veuillez spécifier des salons vocaux valides.", ephemeral: true });
        }

        try {
            await interaction.deferReply();

            let movedCount = 0;
            for (const [memberId, member] of sourceChannel.members) {
                await member.voice.setChannel(destChannel);
                movedCount++;
            }

            await interaction.editReply(`${movedCount} membre(s) ont été déplacés de ${sourceChannel.name} vers ${destChannel.name}.`);
        } catch (error) {
            console.error(error);
            if (interaction.deferred) {
                await interaction.editReply("Une erreur s'est produite lors du déplacement des membres.");
            } else {
                await interaction.reply({ content: "Une erreur s'est produite lors du déplacement des membres.", ephemeral: true });
            }
        }
    }
};