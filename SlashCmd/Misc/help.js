const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription("Affiche la page d'aide du bot")
        .addStringOption(option => 
            option.setName('commande')
                .setDescription('Nom de la commande spécifique')
                .setRequired(false)),
                cooldowns: 5,
                usage: `commandes`,
    async execute(client, interaction, color) {
        const commandName = interaction.options.getString('commande');
        const prefix = '/'; // Les commandes slash utilisent toujours '/'

        try {
            if (commandName) {
                const command = client.slashCommands.get(commandName);

                if (!command) {
                    return interaction.reply(`La commande \`${commandName}\` n'existe pas.`);
                }

                const commandHelp = new EmbedBuilder()
                    .setTitle(`Aide pour la commande: \`${command.data.name}\``)
                    .setColor(color)
                    .setFooter({ text: process.env.BOT_FOOTER });

                if (command.data.description) commandHelp.setDescription(`\`${command.data.description}\``);
                if (command.usage) commandHelp.addFields({ name: 'Utilisation', value: `\`${prefix}${command.data.name} ${command.usage}\`` });
                if (command.cooldown) commandHelp.addFields({ name: 'Cooldown', value: `\`${command.cooldowns} secondes\`` });
                if (command.examples) commandHelp.addFields({ name: 'Exemples', value: command.examples.map(example => `\`${prefix}${command.data.name} ${example}\``).join('\n') });

                return interaction.reply({ embeds: [commandHelp], ephemeral: true });
            }

            const embed = new EmbedBuilder()
                .setTitle(`Aide du Bot`)
                .setThumbnail(client.user.displayAvatarURL())
                .setColor(color)
                .setFooter({ text: process.env.BOT_FOOTER })
                .setDescription(`Sélectionnez une catégorie dans le menu déroulant ci-dessous pour voir les commandes correspondantes.\n\nPour obtenir de l'aide sur une commande spécifique, utilisez \`${prefix}help <nom de la commande>\`.\n\nJe possède \`${client.slashCommands.size} commandes\`.`);

            const categories = [
                { label: 'Antiraid', description: 'Commandes liées à l\'antiraid', value: 'antiraid', emoji: '🛡️' },
                { label: 'Modération', description: 'Commandes de modération', value: 'moderation', emoji: '🛠️' },
                { label: 'Misc', description: 'Commandes diverses', value: 'misc', emoji: '📌' },
                { label: 'Fun', description: 'Commandes de jeux et de divertissement', value: 'fun', emoji: '🎉' },
                { label: 'Owner', description: 'Commandes réservées aux propriétaires', value: 'owner', emoji: '👑' }
            ];

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('help_category')
                .setPlaceholder('Choisissez une catégorie')
                .addOptions(categories);

            const linkButton = new ButtonBuilder()
                .setLabel('Support Discord')
                .setURL(process.env.SUPPORT_INVITE)
                .setEmoji('📎')
                .setStyle(ButtonStyle.Link);

            const linkButton2 = new ButtonBuilder()
                .setLabel('Invitation Bot')
                .setURL(process.env.INVITATION_BOT)
                .setEmoji('📎')
                .setStyle(ButtonStyle.Link);

            const row1 = new ActionRowBuilder().addComponents(selectMenu);
            const row2 = new ActionRowBuilder().addComponents(linkButton, linkButton2);

            const response = await interaction.reply({
                embeds: [embed],
                components: [row1, row2],
                ephemeral: false
            });

            const collector = response.createMessageComponentCollector({ time: 60000 });

            collector.on('collect', async (i) => {
                if (i.user.id !== interaction.user.id) {
                    return i.reply({ content: "Vous ne pouvez pas utiliser ce menu.", ephemeral: true });
                }

                if (i.isStringSelectMenu()) {
                    const category = i.values[0];
                    const commands = {
                        antiraid: `
\`${prefix}antiraid [on/off/max/config]\` - Configure les paramètres généraux de l'antiraid
\`${prefix}whitelist <add/clear/list/remove>\` - Gère la liste blanche de l'antiraid
Pour plus de détails sur une commande, utilisez \`${prefix}help <nom de la commande>\``,

                        moderation: `
\`${prefix}ban <@utilisateur> [raison]\` - Bannir un utilisateur du serveur
\`${prefix}kick <@utilisateur> [raison]\` - Expulser un utilisateur du serveur
\`${prefix}mute <@utilisateur> <durée> [raison]\` - Mettre un utilisateur en sourdine
\`${prefix}clear <nombre>\` - Supprimer un certain nombre de messages
\`${prefix}warn <@utilisateur> <raison>\` - Avertir un utilisateur
\`${prefix}unwarn <@utilisateur> <ID avertissement>\` - Retirer un avertissement
\`${prefix}warnlist [@utilisateur]\` - Afficher la liste des avertissements d'un utilisateur
\`${prefix}lock [on/off]\` - Verrouiller ou déverrouiller un canal
\`${prefix}slowmode <durée>\` - Définit le mode lent dans un canal
\`${prefix}nuke\` - Recrée le canal actuel
\`${prefix}role <@utilisateur> <@rôle>\` - Ajoute ou retire un rôle à un utilisateur
\`${prefix}lockdown <on/off>\` - Verrouille ou déverrouille tous les canaux du serveur
\`${prefix}voicemove <ID source> <ID destination>\` - Déplace tous les membres d'un salon vocal vers un autre

Pour plus de détails sur une commande, utilisez \`${prefix}help <nom de la commande>\``,
                        misc: `
\`${prefix}help\` - Affiche ce message d'aide
\`${prefix}ping\` - Vérifie la latence du bot
\`${prefix}serverinfo\` - Affiche les informations du serveur
\`${prefix}botinfo\` - Affiche les informations du bot
\`${prefix}userinfo [@utilisateur]\` - Affiche les informations d'un utilisateur
\`${prefix}banner [@utilisateur]\` - Affiche la bannière d'un utilisateur
\`${prefix}avatar [@utilisateur]\` - Affiche l'avatar d'un utilisateur

Pour plus de détails sur une commande, utilisez \`${prefix}help <nom de la commande>\``,

                        fun: `
\`${prefix}8ball <question>\` - Pose une question à la boule magique
\`${prefix}coinflip\` - Lance une pièce
\`${prefix}rps <pierre|papier|ciseaux>\` - Joue à pierre-papier-ciseaux contre le bot
\`${prefix}meme\` - Affiche un meme aléatoire
\`${prefix}joke\` - Raconte une blague

Pour plus de détails sur une commande, utilisez \`${prefix}help <nom de la commande>\``,
                        owner: `
\`${prefix}blacklist <add/clear/list/remove>\` - Gère la liste noire du bot
\`${prefix}owner <add/clear/list/remove>\` - Gère les propriétaires du bot

Pour plus de détails sur une commande, utilisez \`${prefix}help <nom de la commande>\``
                    };

                    const newEmbed = new EmbedBuilder()
                        .setTitle(`Aide - ${category.charAt(0).toUpperCase() + category.slice(1)}`)
                        .setColor(process.env.DEFAULT_COLOR)
                        .setFooter({ text: process.env.BOT_FOOTER })
                        .setDescription(commands[category]);

                    await i.update({ embeds: [newEmbed] });
                }
            });

            collector.on('end', () => {
                interaction.editReply({ components: [row2] });
            });

        } catch (error) {
            console.error("Erreur dans la commande help:", error);
            interaction.reply({ content: "Une erreur s'est produite lors de l'exécution de la commande.", ephemeral: true }).catch(console.error);
        }
    }
};