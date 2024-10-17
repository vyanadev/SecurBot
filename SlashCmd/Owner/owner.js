const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('owner')
        .setDescription('Permet de gérer les owners du bot')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Ajouter un utilisateur comme owner')
                .addUserOption(option => option.setName('utilisateur').setDescription('L\'utilisateur à ajouter comme owner').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Retirer un utilisateur des owners')
                .addUserOption(option => option.setName('utilisateur').setDescription('L\'utilisateur à retirer des owners').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('clear')
                .setDescription('Supprimer tous les owners sauf les owners principaux'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('Afficher la liste des owners')),
                cooldowns: 10,
    async execute(client, interaction, color) {
        const isOwner = process.env.OWNER_IDS.split(',').includes(interaction.user.id);
        if (!isOwner) return interaction.reply({ content: "Vous n'avez pas la permission d'utiliser cette commande.", ephemeral: true });

        const subcommand = interaction.options.getSubcommand();

        if (subcommand === "add") {
            const member = interaction.options.getUser('utilisateur');

            const [existingOwner] = await interaction.client.db.promise().query('SELECT COUNT(*) AS count FROM bot_owners WHERE user_id = ?', [member.id]);
            if (existingOwner[0].count > 0) return interaction.reply({ content: `${member.username} est déjà owner`, ephemeral: true });

            await interaction.client.db.promise().query('INSERT INTO bot_owners (user_id, is_owner) VALUES (?, true)', [member.id]);
            return interaction.reply({ content: `${member.username} est maintenant owner` });

        } else if (subcommand === "clear") {
            const [result] = await interaction.client.db.promise().query('DELETE FROM bot_owners WHERE user_id NOT IN (?)', [process.env.OWNER_IDS.split(',')]);
            const count = result.affectedRows;
            return interaction.reply({ content: `${count} ${count > 1 ? "personnes ont été supprimées" : "personne a été supprimée"} des owners` });

        } else if (subcommand === "remove") {
            const member = interaction.options.getUser('utilisateur');

            const [existingOwner] = await interaction.client.db.promise().query('SELECT COUNT(*) AS count FROM bot_owners WHERE user_id = ?', [member.id]);
            if (existingOwner[0].count === 0) return interaction.reply({ content: `${member.username} n'est pas owner`, ephemeral: true });

            await interaction.client.db.promise().query('DELETE FROM bot_owners WHERE user_id = ?', [member.id]);
            return interaction.reply({ content: `${member.username} n'est plus owner` });

        } else if (subcommand === "list") {
            const [owners] = await interaction.client.db.promise().query('SELECT user_id FROM bot_owners');
            const count = 15;
            let page = 1;

            const generateEmbed = (start) => {
                const current = owners.slice(start, start + count);
                const embed = new EmbedBuilder()
                    .setTitle(`Owner`)
                    .setFooter({ text: `${page} / ${Math.ceil(owners.length / count) || 1}` })
                    .setColor(process.env.DEFAULT_COLOR)
                    .setDescription(current.map(owner => `<@${owner.user_id}>`).join('\n') || "Aucune donnée trouvée");
                return embed;
            };

            await interaction.deferReply();

            if (owners.length > count) {
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
                            currentIndex = owners.length - count;
                            page = Math.ceil(owners.length / count);
                        }
                    } else if (i.customId === `next_${interaction.id}`) {
                        page++;
                        currentIndex += count;
                        if (currentIndex >= owners.length) {
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