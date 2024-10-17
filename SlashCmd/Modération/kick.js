const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Expulser un membre du serveur')
        .addUserOption(option => 
            option.setName('utilisateur')
                .setDescription('Le membre à expulser')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('raison')
                .setDescription('La raison de l\'expulsion')
                .setRequired(false)),
                cooldowns: 5,
    async execute(client, interaction, color) {
        // Vérifications de permissions
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers) &&
            !interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: "Vous n'avez pas la permission d'expulser des membres.", ephemeral: true });
        }

        if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.KickMembers)) {
            return interaction.reply({ content: "Je n'ai pas la permission d'expulser des membres.", ephemeral: true });
        }

        const user = interaction.options.getUser('utilisateur');
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);
        
        if (!member) {
            return interaction.reply({ content: "Je ne peux pas trouver ce membre.", ephemeral: true });
        }

        if (member.roles.highest.position >= interaction.member.roles.highest.position && interaction.user.id !== interaction.guild.ownerId) {
            return interaction.reply({ content: "Vous ne pouvez pas expulser ce membre car son rôle est supérieur ou égal au vôtre.", ephemeral: true });
        }

        if (member.roles.highest.position >= interaction.guild.members.me.roles.highest.position) {
            return interaction.reply({ content: "Je ne peux pas expulser ce membre car son rôle est supérieur ou égal au mien.", ephemeral: true });
        }

        if (!member.kickable) {
            return interaction.reply({ content: "Je ne peux pas expulser ce membre.", ephemeral: true });
        }

        const reason = interaction.options.getString('raison') || 'Aucune raison fournie';

        try {
            await member.kick(reason);
            const embed = new EmbedBuilder()
                .setTitle('Membre expulsé')
                .setDescription(`${member.user.tag} a été expulsé du serveur.`)
                .addFields({ name: 'Raison', value: reason })
                .setColor(process.env.DEFAULT_COLOR)
                .setTimestamp();
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: "Une erreur s'est produite lors de l'expulsion.", ephemeral: true });
        }
    }
};