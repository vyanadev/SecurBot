const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'help',
    description: "Affiche la pages d'aide du bot",
    usage: `[commandes]`,
    aliases: ["h"],
    cooldowns: 5,
    execute: async (client, message, args, prefix, color) => {
        try {
                if (args.length > 0) {
                const commandName = args[0].toLowerCase();
                const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

                if (!command) {
                    return message.reply(`La commande \`${commandName}\` n'existe pas.`);
                }

                const commandHelp = new EmbedBuilder()
                    .setTitle(`Aide pour la commande: \`${command.name}\``)
                    .setColor(color)
                    .setFooter({ text: process.env.BOT_FOOTER });

                if (command.description) commandHelp.setDescription(`\`${command.description}\``);
                if (command.aliases) commandHelp.addFields({ name: 'Aliases', value: `\`${command.aliases.join('`, `')}\`` });
                if (command.usage) commandHelp.addFields({ name: 'Utilisation', value: `\`${prefix}${command.name} ${command.usage}\`` });
                if (command.cooldowns) commandHelp.addFields({ name: 'Cooldown', value: `\`${command.cooldowns} secondes\`` });
                if (command.examples) commandHelp.addFields({ name: 'Exemples', value: command.examples.map(example => `\`${prefix}${command.name} ${example}\``).join('\n') });

                return message.reply({ embeds: [commandHelp], allowedMentions: { repliedUser: false } });
            }

            const embed = new EmbedBuilder()
                .setTitle(`Aide du Bot`)
                .setColor(color)
                .setFooter({ text: process.env.BOT_FOOTER })
                .setDescription(`Sélectionnez une catégorie dans le menu déroulant ci-dessous pour voir les commandes correspondantes.\nPour obtenir de l'aide sur une commande spécifique, utilisez \`${prefix}help <nom de la commande>\`.`);

            const categories = [
                { label: 'Antiraid', description: 'Commandes liées à l\'antiraid', value: 'antiraid', emoji: '🛡️' },
                { label: 'Modération', description: 'Commandes de modération', value: 'moderation', emoji: '🛠️' },
                { label: 'Misc', description: 'Commandes diverses', value: 'misc', emoji: '📌' },
                { label: 'Owner', description: 'Commandes réservées aux propriétaires', value: 'owner', emoji: '👑' }
            ];

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('help_category')
                .setPlaceholder('Choisissez une catégorie')
                .addOptions(categories);

            const linkButton = new ButtonBuilder()
                .setLabel('Support Discord')
                .setURL(process.env.SUPPORT_INVITE)
                .setStyle(ButtonStyle.Link);

            
                const linkButton2 = new ButtonBuilder()
                .setLabel('Invitation Bot')
                .setURL(process.env.INVITATION_BOT)
                .setStyle(ButtonStyle.Link);

            const row1 = new ActionRowBuilder().addComponents(selectMenu);
            const row2 = new ActionRowBuilder().addComponents(linkButton, linkButton2);

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
                    const category = interaction.values[0];
                    const commands = {
                        antiraid: `
\`${prefix}antiraid [on/off/max/config]\` - Configure les paramètres généraux de l'antiraid
\`${prefix}whitelist <add/clear/list/remove>\` - Gère la liste blanche de l'antiraid
\`${prefix}antibot [on/off]\` - Active ou désactive la protection contre l'ajout de bots
\`${prefix}antichannel [on/off]\` - Active ou désactive la protection contre la création/suppression de salons
\`${prefix}antiwebhook [on/off]\` - Active ou désactive la protection contre la création de webhooks
\`${prefix}antieveryone [on/off]\` - Active ou désactive la protection contre les mentions @everyone
\`${prefix}antiban [on/off]\` - Active ou désactive la protection contre les bannissements en masse

Pour plus de détails sur une commande, utilisez \`${prefix}help <nom de la commande>\`
`,
moderation: `
\`${prefix}ban <@utilisateur> [raison]\` - Bannir un utilisateur du serveur
\`${prefix}kick <@utilisateur> [raison]\` - Expulser un utilisateur du serveur
\`${prefix}mute <@utilisateur> <durée> [raison]\` - Mettre un utilisateur en sourdine
\`${prefix}clear <nombre>\` - Supprimer un certain nombre de messages
\`${prefix}warn <@utilisateur> <raison>\` - Avertir un utilisateur
\`${prefix}unwarn <@utilisateur> <ID avertissement>\` - Retirer un avertissement
\`${prefix}warnlist [@utilisateur]\` - Afficher la liste des avertissements d'un utilisateur
\`${prefix}lock [on/off]\` - Verrouiller ou déverrouiller un canal

Pour plus de détails sur une commande, utilisez \`${prefix}help <nom de la commande>\`
`,
                        misc: `
\`${prefix}help\` - Affiche ce message d'aide
\`${prefix}ping\` - Vérifie la latence du bot
\`${prefix}serverinfo\` - Affiche les informations du serveur
\`${prefix}botinfo\` - Affiche les informations du bot
\`${prefix}userinfo [@utilisateur]\` - Affiche les informations d'un utilisateur
\`${prefix}banner [@utilisateur]\` - Affiche la bannière d'un utilisateur
\`${prefix}avatar [@utilisateur]\` - Affiche l'avatar d'un utilisateur

Pour plus de détails sur une commande, utilisez \`${prefix}help <nom de la commande>\`
`,
                        owner: `
\`${prefix}blacklist <add/clear/list/remove>\` - Gère la liste noire du bot
\`${prefix}owner <add/clear/list/remove>\` - Gère les propriétaires du bot

Pour plus de détails sur une commande, utilisez \`${prefix}help <nom de la commande>\`
`
                    };

                    const newEmbed = new EmbedBuilder()
                        .setTitle(`Aide - ${category.charAt(0).toUpperCase() + category.slice(1)}`)
                        .setColor(process.env.DEFAULT_COLOR)
                        .setFooter({ text: process.env.BOT_FOOTER })
                        .setDescription(commands[category]);

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
