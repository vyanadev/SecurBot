const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Bannir un membre du serveur')
        .addUserOption(option => 
            option.setName('utilisateur')
                .setDescription('L\'utilisateur à bannir')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('raison')
                .setDescription('La raison du bannissement')
                .setRequired(false)),
                cooldowns: 5,
    async execute(client, interaction, color) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers) &&
            !interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: "Vous n'avez pas la permission de bannir des membres.", ephemeral: true });
        }

        if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return interaction.reply({ content: "Je n'ai pas la permission de bannir des membres.", ephemeral: true });
        }

        const user = interaction.options.getUser('utilisateur');
        const reason = interaction.options.getString('raison') || 'Aucune raison fournie';

        const member = interaction.guild.members.cache.get(user.id);
        if (member) {
            if (member.roles.highest.position >= interaction.member.roles.highest.position && interaction.user.id !== interaction.guild.ownerId) {
                return interaction.reply({ content: "Vous ne pouvez pas bannir ce membre car son rôle est supérieur ou égal au vôtre.", ephemeral: true });
            }
            if (member.roles.highest.position >= interaction.guild.members.me.roles.highest.position) {
                return interaction.reply({ content: "Je ne peux pas bannir ce membre car son rôle est supérieur ou égal au mien.", ephemeral: true });
            }
        }

        try {
            await interaction.guild.members.ban(user, { reason });
            const embed = new EmbedBuilder()
                .setTitle('Membre banni')
                .setDescription(`${user.tag} a été banni du serveur.`)
                .addFields({ name: 'Raison', value: reason })
                .setColor(process.env.DEFAULT_COLOR)
                .setTimestamp();
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: "Une erreur s'est produite lors du bannissement.", ephemeral: true });
        }
    }
};