const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'help',
    aliases: ["h"],
    execute: async (client, message, args, prefix, color) => {
        try {
            const [ownerResult] = await client.db.promise().query('SELECT * FROM bot_owners WHERE user_id = ?', [message.author.id]);
            if (ownerResult.length === 0) return;

            const embed = new EmbedBuilder()
                .setTitle(`Help`)
                .setColor(color)
                .setFooter({ text: process.env.BOT_FOOTER })
                .setDescription("Sélectionnez une catégorie dans le menu déroulant ci-dessous pour voir les commandes correspondantes.");

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('help_category')
                .setPlaceholder('Choisissez une catégorie')
                .addOptions([
                    {
                        label: 'Antiraid',
                        description: 'Commandes liées à l\'antiraid',
                        value: 'antiraid',
                    },
                    {
                        label: 'Misc',
                        description: 'Commandes diverses',
                        value: 'misc',
                    },
                    {
                        label: 'Owner',
                        description: 'Commandes réservées aux propriétaires',
                        value: 'owner',
                    },
                ]);

            const linkButton = new ButtonBuilder()
                .setLabel('Support Discord')
                .setURL(process.env.SUPPORT_INVITE)
                .setStyle(ButtonStyle.Link);

            const row1 = new ActionRowBuilder().addComponents(selectMenu);
            const row2 = new ActionRowBuilder().addComponents(linkButton);

            const response = await message.reply({
                embeds: [embed],
                components: [row1, row2],
                allowedMentions: { repliedUser: false }
            });

            const collector = response.createMessageComponentCollector({ time: 60000 });

            collector.on('collect', async (interaction) => {
                if (interaction.user.id !== message.author.id) {
                    return interaction.reply({ content: "Vous ne pouvez pas utiliser ce menu.", ephemeral: true });
                }

                if (interaction.isStringSelectMenu()) {
                    let description;
                    switch (interaction.values[0]) {
                        case 'antiraid':
                            description = `\`\`\`${prefix}antiraid [on/off/max/config]\n${prefix}whitelist <add/clear/list/remove>\n${prefix}verify <on/off>\`\`\``;
                            break;
                        case 'misc':
                            description = `\`\`\`${prefix}help\n${prefix}ping\`\`\``;
                            break;
                        case 'owner':
                            description = `\`\`\`${prefix}blacklist <add/clear/list/remove>\n${prefix}owner <add/clear/list/remove>\`\`\``;
                            break;
                    }

                    const newEmbed = new EmbedBuilder()
                        .setTitle(`Help - ${interaction.values[0].charAt(0).toUpperCase() + interaction.values[0].slice(1)}`)
                        .setColor(process.env.DEFAULT_COLOR)
                        .setFooter({ text: process.env.BOT_FOOTER  })
                        .setDescription(description);

                    await interaction.update({ embeds: [newEmbed] });
                }
            });

            collector.on('end', () => {
                response.edit({ components: [row2] });
            });

        } catch (error) {
            console.error("Erreur dans la commande help:", error);
            message.reply("Une erreur s'est produite lors de l'exécution de la commande.").catch(console.error);
        }
    }
};  
