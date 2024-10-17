const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setup")
        .setDescription("Système de configuration de protection du serveur.")
        .addSubcommand(subcommand =>
            subcommand
                .setName("antiraid")
                .setDescription("Configure le système antiraid")
                .addStringOption(option =>
                    option.setName("mode")
                        .setDescription("Mode de configuration")
                        .setRequired(true)
                        .addChoices(
                            { name: "on", value: "on" },
                            { name: "off", value: "off" },
                            { name: "max", value: "max" },
                            { name: "config", value: "config" }
                        )
                )
        ),
    cooldowns: 10,
    async execute(client, interaction) {
        try {
            const [ownerResult] = await client.db.promise().query('SELECT COUNT(*) AS count FROM bot_owners WHERE user_id = ?', [interaction.user.id]);
            if (ownerResult[0].count === 0) return interaction.reply({ content: "Vous n'avez pas la permission d'utiliser cette commande.", ephemeral: true });

            const mode = interaction.options.getString("mode");

            const lgs = { name: "Logs", emoji: "1️⃣", type: 1, db: "logs" };
            const antiraidEvents = [
                [
                    { name: "Création de rôle", emoji: "2️⃣", db: "rolecreate" },
                    { name: "Suppression de rôle", emoji: "3️⃣", db: "roledelete" },
                    { name: "Modification de rôle", emoji: "4️⃣", db: "roleedit" },
                    { name: "Ajout de rôle avec des permissions dangereuses", emoji: "5️⃣", db: "roleadd" },
                ],
                [
                    { name: "Création de salon", emoji: "2️⃣", db: "channelcreate" },
                    { name: "Suppression de salon", emoji: "3️⃣", db: "channeldelete" },
                    { name: "Modification de salon", emoji: "4️⃣", db: "channeledit" },
                    { name: "Modification du serveur", emoji: "5️⃣", db: "update" },
                ],
                [
                    { name: "Création de webhook", emoji: "2️⃣", db: "webhook" },
                    { name: "Ajout de bot", emoji: "3️⃣", db: "bot" },
                    { name: "Bannissement/Expulsion de membre", emoji: "4️⃣", db: "ban" },
                    { name: "Message contenant une invitation discord", emoji: "5️⃣", db: "pub", sanction: "exclusion 5m" },
                ],
                [
                    { name: "Multiplication de ping", emoji: "2️⃣", db: "ping", sanction: "exclusion 5m" },
                    { name: "Multiplication de message", emoji: "3️⃣", db: "spam", sanction: "exclusion 5m" },
                    { name: "Déconnexion de membre", emoji: "4️⃣", db: "deco" },
                    { name: "Mettre en mute des membres", emoji: "5️⃣", db: "mute" },
                ]
            ];

            if (mode === "on" || mode === "off" || mode === "max") {
                await interaction.deferReply();
                const status = mode === "on" || mode === "max";
                const whitelist = mode === "max";
                const sanction = mode === "max" ? "ban" : "derank";

                await Promise.all(antiraidEvents.flat().map(e => 
                    client.db.promise().query('INSERT INTO antiraid (guild_id, event, status, whitelist, sanction) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE status = ?, whitelist = ?, sanction = ?', 
                        [interaction.guild.id, e.db, status, whitelist, sanction, status, whitelist, sanction])
                ));

                await interaction.editReply(`Tous les événements d'antiraid ont été ${mode === "off" ? "désactivés" : `activés${mode === "max" ? " en \`max\`" : ""}`}`);
            } else if (mode === "config") {
                await interaction.deferReply();
                let currentPage = 1;
                const message = await displayPage(currentPage);

                const collector = message.createMessageComponentCollector({ time: 600000 });
                collector.on("collect", async i => {
                    if (i.user.id !== interaction.user.id) return i.reply({ content: "Vous ne pouvez pas utiliser ce menu.", ephemeral: true });
                    
                    try {
                        await i.deferUpdate();
                        
                        if (i.customId.startsWith("antiraid")) {
                            currentPage = parseInt(i.customId.split("_")[1]);
                            await displayPage(currentPage);
                        } else if (i.isStringSelectMenu()) {
                            await handleMenuSelection(i, currentPage);
                        }
                    } catch (error) {
                        console.error("Erreur lors de la gestion de l'interaction:", error);
                    }
                });

                collector.on("end", () => {
                    interaction.deleteReply().catch(console.error);
                });
            }

            async function displayPage(pageNumber) {
                const currentArray = antiraidEvents[pageNumber - 1];
                const array_menu = [
                    { label: lgs.name, value: lgs.name, emoji: lgs.emoji },
                    ...currentArray.map(e => ({ label: e.name, value: e.name + "_" + interaction.id, emoji: e.emoji })),
                    { label: "Annuler", value: "Annuler", emoji: "❌" }
                ];

                const array_fields = [
                    { name: `${lgs.emoji} ・ ${lgs.name}`, value: `Salon: ${await getLogs()}` },
                    ...await Promise.all(currentArray.map(async e => ({ name: `${e.emoji} ・ ${e.name}`, value: await getEventStatus(e) })))
                ];

                const menu = new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId(`menu${pageNumber}_${interaction.id}`)
                        .setPlaceholder("Faites un choix")
                        .addOptions(array_menu)
                );

                const btn = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId(`antiraid_${pageNumber === 1 ? 4 : pageNumber - 1}`)
                        .setLabel("◀")
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId(`antiraid_${pageNumber === 4 ? 1 : pageNumber + 1}`)
                        .setLabel("▶")
                        .setStyle(ButtonStyle.Primary)
                );

                const embed = new EmbedBuilder()
                    .setTitle(`Configuration des événements d'antiraid`)
                    .setColor(process.env.DEFAULT_COLOR)
                    .addFields(array_fields)
                    .setFooter({ text: `${pageNumber} / 4` });

                return await interaction.editReply({ content: null, embeds: [embed], components: [menu, btn] });
            }

            async function handleMenuSelection(i, currentPage) {
                const value = i.values[0];
                if (value === "Logs") {
                    await handleLogsSelection(i);
                } else if (value !== "Annuler") {
                    await handleEventSelection(i, value, currentPage);
                }
            }

            async function handleLogsSelection(i) {
                const embed = new EmbedBuilder()
                    .setColor(process.env.DEFAULT_COLOR)
                    .setDescription(`Quel est **le nouveau salon de logs** ?`);
                const msg = await i.channel.send({ embeds: [embed] });
                const filter = m => m.author.id === i.user.id;
                const collected = await msg.channel.awaitMessages({ filter, max: 1, time: 600000, errors: ["time"] });
                await msg.delete().catch(console.error);
                const response = collected.first();
                if (response) {
                    await response.delete().catch(console.error);
                    const channel = i.guild.channels.cache.get(response.content) || response.mentions.channels.first();
                    if (!channel) return i.followUp({ content: `Aucun salon trouvé pour \`${response.content}\``, ephemeral: true });
                    await client.db.promise().query('INSERT INTO antiraid_logs (guild_id, channel_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE channel_id = ?', 
                        [i.guild.id, channel.id, channel.id]);
                }
                await displayPage(1);
            }

            async function handleEventSelection(i, value, currentPage) {
                const eventName = value.split('_')[0];
                const event = antiraidEvents.flat().find(e => e.name === eventName);
                if (!event) return;

                const embed = new EmbedBuilder()
                    .setTitle(`${event.emoji} ・ ${event.name}`)
                    .setColor(process.env.DEFAULT_COLOR);

                const components = [
                    createSelectMenu(`${event.name}onoff_${i.id}`, "Activité", [
                        { label: `On`, value: event.name + "on_" + i.id, emoji: "✅", description: "Activer: " + event.name },
                        { label: `Off`, value: event.name + "off_" + i.id, emoji: "❌", description: "Désactiver: " + event.name },
                    ]),
                    createSelectMenu(`${event.name}wl_${i.id}`, "Whitelist Bypass", [
                        { label: `WhitelistBypass On`, value: event.name + "wla_" + i.id, emoji: "👤", description: "Activer la whitelist bypass pour: " + event.name },
                        { label: `WhitelistBypass Off`, value: event.name + "wld_" + i.id, emoji: "👥", description: "Désactiver la whitelist bypass pour: " + event.name },
                    ])
                ];

                if (!event.sanction) {
                    components.push(createSelectMenu(`${event.name}sanction_${i.id}`, "Sanctions", [
                        { label: `Derank`, value: event.name + "derank_" + i.id, emoji: "👤", description: "Définir la sanction derank pour: " + event.name },
                        { label: `Kick`, value: event.name + "kick_" + i.id, emoji: "⚡", description: "Définir la sanction kick pour: " + event.name },
                        { label: `Ban`, value: event.name + "ban_" + i.id, emoji: "🔌", description: "Définir la sanction ban pour: " + event.name },
                    ]));
                }

                components.push(new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId(event.name + "yes_" + i.id)
                        .setEmoji("✅")
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId(event.name + "non_" + i.id)
                        .setEmoji("✖")
                        .setStyle(ButtonStyle.Danger)
                ));

                const msg = await i.channel.send({ embeds: [embed], components });

                const collector = msg.createMessageComponentCollector({ time: 600000 });
                collector.on("collect", async i2 => {
                    if (i2.user.id !== i.user.id) return i2.reply({ content: "Vous ne pouvez pas utiliser ce menu.", ephemeral: true });
                    try {
                        await i2.deferUpdate();
                        const value2 = i2.values ? i2.values[0] : i2.customId;
                        await handleEventAction(event, value2);
                        if (value2.endsWith("yes_" + i.id)) {
                            await msg.delete().catch(console.error);
                            await displayPage(currentPage);
                        } else if (value2.endsWith("non_" + i.id)) {
                            await msg.delete().catch(console.error);
                        }
                    } catch (error) {
                        console.error("Erreur lors de la gestion de l'interaction:", error);
                    }
                });
            }

            async function handleEventAction(event, value) {
                if (value.endsWith("on_" + interaction.id)) {
                    await client.db.promise().query('UPDATE antiraid SET status = ? WHERE guild_id = ? AND event = ?', [true, interaction.guild.id, event.db]);
                } else if (value.endsWith("off_" + interaction.id)) {
                    await client.db.promise().query('UPDATE antiraid SET status = ? WHERE guild_id = ? AND event = ?', [false, interaction.guild.id, event.db]);
                } else if (value.endsWith("wla_" + interaction.id)) {
                    await client.db.promise().query('UPDATE antiraid SET whitelist = ? WHERE guild_id = ? AND event = ?', [true, interaction.guild.id, event.db]);
                } else if (value.endsWith("wld_" + interaction.id)) {
                    await client.db.promise().query('UPDATE antiraid SET whitelist = ? WHERE guild_id = ? AND event = ?', [false, interaction.guild.id, event.db]);
                } else if (value.includes("derank_") || value.includes("kick_") || value.includes("ban_")) {
                    const sanction = value.split('_')[0].replace(event.name, '');
                    await client.db.promise().query('UPDATE antiraid SET sanction = ? WHERE guild_id = ? AND event = ?', [sanction, interaction.guild.id, event.db]);
                }
            }

            async function getEventStatus(event) {
                const [result] = await client.db.promise().query('SELECT status, sanction, whitelist FROM antiraid WHERE guild_id = ? AND event = ?', [interaction.guild.id, event.db]);
                const status = result.length > 0 ? (result[0].status ? "`🟢`" : "`🔴`") : "`🔴`";
                const sanction = event.sanction ? event.sanction : (result.length > 0 ? result[0].sanction : "kick");
                const whitelist = result.length > 0 ? (result[0].whitelist ? "`🔴`" : "`🟢`") : "`🟢`";
                return `Actif: ${status}\nSanction: \`${sanction}\`\nWhitelist bypass: ${whitelist}`;
            }

            async function getLogs() {
                const [result] = await client.db.promise().query('SELECT channel_id FROM antiraid_logs WHERE guild_id = ?', [interaction.guild.id]);
                return result.length === 0 || !interaction.guild.channels.cache.get(result[0].channel_id) ? "`🔴`" : `<#${result[0].channel_id}>`;
            }

            function createSelectMenu(customId, placeholder, options) {
                return new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId(customId)
                        .setPlaceholder(placeholder)
                        .addOptions(options)
                );
            }
        } catch (error) {
            console.error("Erreur dans la commande setup:", error);
            if (interaction.deferred) {
                interaction.editReply("Une erreur s'est produite lors de l'exécution de la commande.").catch(console.error);
            } else {
                interaction.reply({ content: "Une erreur s'est produite lors de l'exécution de la commande.", ephemeral: true }).catch(console.error);
            }
        }
    }
};