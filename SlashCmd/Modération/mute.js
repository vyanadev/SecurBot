const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Mettre un membre en sourdine')
        .addUserOption(option => 
            option.setName('utilisateur')
                .setDescription('Le membre à mettre en sourdine')
                .setRequired(true))
        .addIntegerOption(option => 
            option.setName('durée')
                .setDescription('La durée de la mise en sourdine en minutes (entre 1 et 40320)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(40320))
        .addStringOption(option => 
            option.setName('raison')
                .setDescription('La raison de la mise en sourdine')
                .setRequired(false)),
                cooldowns: 5,
    async execute(client, interaction, color) {

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers) &&
            !interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: "Vous n'avez pas la permission de modérer les membres.", ephemeral: true });
        }

        if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return interaction.reply({ content: "Je n'ai pas la permission de modérer les membres.", ephemeral: true });
        }

        const user = interaction.options.getUser('utilisateur');
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);
        
        if (!member) {
            return interaction.reply({ content: "Je ne peux pas trouver ce membre.", ephemeral: true });
        }

        if (member.roles.highest.position >= interaction.member.roles.highest.position && interaction.user.id !== interaction.guild.ownerId) {
            return interaction.reply({ content: "Vous ne pouvez pas mettre en sourdine ce membre car son rôle est supérieur ou égal au vôtre.", ephemeral: true });
        }

        if (member.roles.highest.position >= interaction.guild.members.me.roles.highest.position) {
            return interaction.reply({ content: "Je ne peux pas mettre en sourdine ce membre car son rôle est supérieur ou égal au mien.", ephemeral: true });
        }

        if (!member.moderatable) {
            return interaction.reply({ content: "Je ne peux pas mettre ce membre en sourdine.", ephemeral: true });
        }

        const duration = interaction.options.getInteger('durée');
        const reason = interaction.options.getString('raison') || 'Aucune raison fournie';

        try {
            await member.timeout(duration * 60 * 1000, reason);
            const embed = new EmbedBuilder()
                .setTitle('Membre mis en sourdine')
                .setDescription(`${member.user.tag} a été mis en sourdine pour ${duration} minutes.`)
                .addFields(
                    { name: 'Raison', value: reason },
                    { name: 'Durée', value: `${duration} minutes` }
                )
                .setColor(process.env.DEFAULT_COLOR)
                .setTimestamp();
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: "Une erreur s'est produite lors de la mise en sourdine.", ephemeral: true });
        }
    }
};