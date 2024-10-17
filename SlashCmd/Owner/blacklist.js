const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('blacklist')
        .setDescription('Permet de gérer la blacklist')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Ajouter un utilisateur à la blacklist')
                .addUserOption(option => option.setName('utilisateur').setDescription('L\'utilisateur à blacklister').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Retirer un utilisateur de la blacklist')
                .addUserOption(option => option.setName('utilisateur').setDescription('L\'utilisateur à retirer de la blacklist').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('clear')
                .setDescription('Vider la blacklist'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('Afficher la liste des utilisateurs blacklistés')),
                cooldowns: 10,
    async execute(client, interaction, color) {
        // Vérifier si l'utilisateur est un propriétaire du bot
        const [ownerResult] = await interaction.client.db.promise().query('SELECT COUNT(*) AS count FROM bot_owners WHERE user_id = ?', [interaction.user.id]);
        if (ownerResult[0].count === 0) return interaction.reply({ content: "Vous n'avez pas la permission d'utiliser cette commande.", ephemeral: true });

        const subcommand = interaction.options.getSubcommand();

        if (subcommand === "add") {
            const member = interaction.options.getUser('utilisateur');

            // Vérifier si le membre est déjà blacklist
            const [blacklisted] = await interaction.client.db.promise().query('SELECT COUNT(*) AS count FROM blacklist WHERE user_id = ?', [member.id]);
            if (blacklisted[0].count > 0) return interaction.reply({ content: `${member.username} est déjà blacklist`, ephemeral: true });

            // Ajouter le membre à la blacklist
            await interaction.client.db.promise().query('INSERT INTO blacklist (user_id) VALUES (?)', [member.id]);
            return interaction.reply({ content: `${member.username} est maintenant blacklist` });

        } else if (subcommand === "clear") {
            // Supprimer tous les membres de la blacklist
            const [result] = await interaction.client.db.promise().query('DELETE FROM blacklist');
            const count = result.affectedRows;
            return interaction.reply({ content: `${count} ${count > 1 ? "personnes ont été supprimées" : "personne a été supprimée"} de la blacklist` });

        } else if (subcommand === "remove") {
            const member = interaction.options.getUser('utilisateur');

            // Vérifier si le membre est blacklist
            const [blacklisted] = await interaction.client.db.promise().query('SELECT COUNT(*) AS count FROM blacklist WHERE user_id = ?', [member.id]);
            if (blacklisted[0].count === 0) return interaction.reply({ content: `${member.username} n'est pas blacklist`, ephemeral: true });

            // Supprimer le membre de la blacklist
            await interaction.client.db.promise().query('DELETE FROM blacklist WHERE user_id = ?', [member.id]);
            return interaction.reply({ content: `${member.username} n'est plus blacklist` });

        } else if (subcommand === "list") {
            const [blacklisted] = await interaction.client.db.promise().query('SELECT user_id FROM blacklist');
            const count = 15;
            let page = 1;

            const generateEmbed = (start) => {
                const current = blacklisted.slice(start, start + count);
                const embed = new EmbedBuilder()
                    .setTitle(`Blacklist`)
                    .setFooter({ text: `${page} / ${Math.ceil(blacklisted.length / count) || 1}` })
                    .setColor(process.env.DEFAULT_COLOR)
                    .setDescription(current.map(user => `<@${user.user_id}>`).join('\n') || "Aucune donnée trouvée");
                return embed;
            };

            await interaction.deferReply();

            if (blacklisted.length > count) {
                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(`prev_${interaction.id}`)
                            .setLabel('◀')
                            .setStyle(ButtonStyle.Primary),
                        new ButtonBuilder()
                            .setCustomId(`next_${interaction.id}`)
                            .setLabel('▶')
                            .setStyle(ButtonStyle.Primary)
                    );

                const msg = await interaction.editReply({ embeds: [generateEmbed(0)], components: [row] });

                const collector = msg.createMessageComponentCollector({ time: 60000 * 5 });

                let currentIndex = 0;
                collector.on('collect', async i => {
                    if (i.user.id !== interaction.user.id) return i.reply({ content: `Vous ne pouvez pas utiliser ces boutons.`, ephemeral: true });
                    await i.deferUpdate();

                    if (i.customId === `prev_${interaction.id}`) {
                        page--;
                        currentIndex -= count;
                        if (currentIndex < 0) {
                            currentIndex = blacklisted.length - count;
                            page = Math.ceil(blacklisted.length / count);
                        }
                    } else if (i.customId === `next_${interaction.id}`) {
                        page++;
                        currentIndex += count;
                        if (currentIndex >= blacklisted.length) {
                            currentIndex = 0;
                            page = 1;
                        }
                    }

                    await interaction.editReply({ embeds: [generateEmbed(currentIndex)], components: [row] });
                });

                collector.on('end', () => {
                    interaction.editReply({ components: [] });
                });
            } else {
                interaction.editReply({ embeds: [generateEmbed(0)] });
            }
        }
    }
};