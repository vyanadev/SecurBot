const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('whitelist')
        .setDescription("Gère la whitelist du serveur")
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription("Ajoute un utilisateur à la whitelist")
                .addUserOption(option => option.setName('utilisateur').setDescription("L'utilisateur à ajouter").setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription("Retire un utilisateur de la whitelist")
                .addUserOption(option => option.setName('utilisateur').setDescription("L'utilisateur à retirer").setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('clear')
                .setDescription("Vide la whitelist"))
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription("Affiche la liste des utilisateurs whitelistés")),
                cooldowns: 10,
    async execute(client, interaction, color) {
        try {
            // Vérifier si l'utilisateur est un propriétaire du bot
            const [ownerResult] = await client.db.promise().query('SELECT COUNT(*) AS count FROM bot_owners WHERE user_id = ?', [interaction.user.id]);
            if (ownerResult[0].count === 0) return interaction.reply({ content: "Vous n'avez pas la permission d'utiliser cette commande.", ephemeral: true });

            const subcommand = interaction.options.getSubcommand();

            if (subcommand === "add") {
                const member = interaction.options.getUser('utilisateur');

                // Vérifier si le membre est déjà whitelist
                const [whitelisted] = await client.db.promise().query('SELECT COUNT(*) AS count FROM whitelist WHERE guild_id = ? AND user_id = ?', [interaction.guild.id, member.id]);
                if (whitelisted[0].count > 0) return interaction.reply({ content: `${member.username} est déjà whitelist`, ephemeral: true });

                // Ajouter le membre à la whitelist
                await client.db.promise().query('INSERT INTO whitelist (guild_id, user_id) VALUES (?, ?)', [interaction.guild.id, member.id]);
                return interaction.reply({ content: `${member.username} est maintenant whitelist`, ephemeral: true });

            } else if (subcommand === "clear") {
                // Supprimer tous les membres de la whitelist
                const [result] = await client.db.promise().query('DELETE FROM whitelist WHERE guild_id = ?', [interaction.guild.id]);
                const count = result.affectedRows;
                return interaction.reply({ content: `${count} ${count > 1 ? "personnes ont été supprimées" : "personne a été supprimée"} de la whitelist`, ephemeral: true });

            } else if (subcommand === "remove") {
                const member = interaction.options.getUser('utilisateur');

                // Vérifier si le membre est whitelist
                const [whitelisted] = await client.db.promise().query('SELECT COUNT(*) AS count FROM whitelist WHERE guild_id = ? AND user_id = ?', [interaction.guild.id, member.id]);
                if (whitelisted[0].count === 0) return interaction.reply({ content: `${member.username} n'est pas whitelist`, ephemeral: true });

                // Supprimer le membre de la whitelist  
                await client.db.promise().query('DELETE FROM whitelist WHERE guild_id = ? AND user_id = ?', [interaction.guild.id, member.id]);
                return interaction.reply({ content: `${member.username} n'est plus whitelist`, ephemeral: true });

            } else if (subcommand === "list") {
                // Récupérer la liste des membres whitelistés
                const [whitelisted] = await client.db.promise().query('SELECT user_id FROM whitelist WHERE guild_id = ?', [interaction.guild.id]);
                
                // Pagination
                const count = 15;
                let page = 1;
                const generateEmbed = (start) => {
                    const current = whitelisted.slice(start, start + count);
                    return new EmbedBuilder()
                        .setTitle(`Whitelist`)
                        .setFooter({ text: `${page} / ${Math.ceil(whitelisted.length / count) || 1}` })
                        .setColor(process.env.DEFAULT_COLOR)
                        .setDescription(current.map(user => `<@${user.user_id}>`).join('\n') || "Aucune donnée trouvée");
                };

                await interaction.deferReply();

                if (whitelisted.length > count) {
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
                        if (i.user.id !== interaction.user.id) return i.reply({ content: "Vous ne pouvez pas utiliser ces boutons.", ephemeral: true });
                        await i.deferUpdate();

                        if (i.customId === `prev_${interaction.id}`) {
                            page--;
                            currentIndex -= count;
                            if (currentIndex < 0) {
                                currentIndex = whitelisted.length - count;
                                page = Math.ceil(whitelisted.length / count);
                            }
                        } else if (i.customId === `next_${interaction.id}`) {
                            page++;
                            currentIndex += count;
                            if (currentIndex >= whitelisted.length) {
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
        } catch (error) {
            console.error("Erreur dans la commande whitelist:", error);
            if (interaction.deferred) {
                interaction.editReply("Une erreur s'est produite lors de l'exécution de la commande.").catch(console.error);
            } else {
                interaction.reply({ content: "Une erreur s'est produite lors de l'exécution de la commande.", ephemeral: true }).catch(console.error);
            }
        }
    }
};