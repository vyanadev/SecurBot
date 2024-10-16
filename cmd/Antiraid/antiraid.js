const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
    name: "setup",
    description: "Affiche le système de configuration de protection du serveur.",
    usage: `[on/off/max/config]`,
    aliases: ["antiraid"],
    cooldowns: 10,
    execute: async (client, message, args, prefix, color) => {
        try {
            const [ownerResult] = await client.db.promise().query('SELECT COUNT(*) AS count FROM bot_owners WHERE user_id = ?', [message.author.id]);
            if (ownerResult[0].count === 0) return;

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

            const subcommand = args[0];

            if (subcommand === "on" || subcommand === "off" || subcommand === "max") {
                const msg = await message.reply({ content: `Chargement...`, allowedMentions: { repliedUser: false } });
                const status = subcommand === "on" || subcommand === "max";
                const whitelist = subcommand === "max";
                const sanction = subcommand === "max" ? "ban" : "derank";

                await Promise.all(antiraidEvents.flat().map(e => 
                    client.db.promise().query('INSERT INTO antiraid (guild_id, event, status, whitelist, sanction) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE status = ?, whitelist = ?, sanction = ?', 
                        [message.guild.id, e.db, status, whitelist, sanction, status, whitelist, sanction])
                ));

                msg.edit({ content: `Tous les événements d'antiraid ont été ${subcommand === "off" ? "désactivés" : `activés${subcommand === "max" ? " en \`max\`" : ""}`}`, allowedMentions: { repliedUser: false } });
            } else if (subcommand === "config" || !subcommand) {
                const msg = await message.reply({ content: `Chargement...`, allowedMentions: { repliedUser: false } });
                await displayPage(1);

                const collector = msg.createMessageComponentCollector({ time: 60000 * 10 });
                collector.on("collect", async i => {
                    if (i.user.id !== message.author.id) return;
                    await i.deferUpdate().catch(console.error);
                    
                    if (i.customId.startsWith("antiraid")) {
                        const pageNumber = parseInt(i.customId.split("_")[0].replace("antiraid", ""));
                        await displayPage(pageNumber);
                    } else if (i.isStringSelectMenu()) {
                        await handleMenuSelection(i);
                    }
                });

                collector.on("end", () => {
                    message.delete().catch(console.error);
                    msg.delete().catch(console.error);
                });

                async function displayPage(pageNumber) {
                    const currentArray = antiraidEvents[pageNumber - 1];
                    const array_menu = [
                        { label: lgs.name, value: lgs.name, emoji: lgs.emoji },
                        ...currentArray.map(e => ({ label: e.name, value: e.name + "_" + message.id, emoji: e.emoji })),
                        { label: "Annuler", value: "Annuler", emoji: "❌" }
                    ];

                    const array_fields = [
                        { name: `${lgs.emoji} ・ ${lgs.name}`, value: `Salon: ${await getLogs()}` },
                        ...await Promise.all(currentArray.map(async e => ({ name: `${e.emoji} ・ ${e.name}`, value: await getEventStatus(e) })))
                    ];

                    const menu = new ActionRowBuilder().addComponents(
                        new StringSelectMenuBuilder()
                            .setCustomId(`menu${pageNumber}_${message.id}`)
                            .setPlaceholder("Faites un choix")
                            .addOptions(array_menu)
                    );

                    const btn = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId(`antiraid${pageNumber === 1 ? 4 : pageNumber - 1}_${message.id}`)
                            .setLabel("◀")
                            .setStyle(ButtonStyle.Primary),
                        new ButtonBuilder()
                            .setCustomId(`antiraid${pageNumber === 4 ? 1 : pageNumber + 1}_${message.id}`)
                            .setLabel("▶")
                            .setStyle(ButtonStyle.Primary)
                    );

                    const embed = new EmbedBuilder()
                        .setTitle(`Configuration des événements d'antiraid`)
                        .setColor(process.env.DEFAULT_COLOR)
                        .addFields(array_fields)
                        .setFooter({ text: `${pageNumber} / 4` });

                    await msg.edit({ content: null, embeds: [embed], components: [menu, btn] });
                }

                async function handleMenuSelection(interaction) {
                    const value = interaction.values[0];
                    if (value === "Logs") {
                        await handleLogsSelection(interaction);
                    } else if (value !== "Annuler") {
                        await handleEventSelection(interaction, value);
                    }
                }

                async function handleLogsSelection(interaction) {
                    const embed = new EmbedBuilder()
                        .setColor(process.env.DEFAULT_COLOR)
                        .setDescription(`Quel est **le nouveau salon de logs** ?`);
                    const msg2 = await interaction.channel.send({ embeds: [embed] });
                    const filter = m => m.author.id === interaction.user.id;
                    const collected = await msg2.channel.awaitMessages({ filter, max: 1, time: 60000 * 10, errors: ["time"] });
                    const response = collected.first();
                    await msg2.delete().catch(console.error);
                    await response.delete().catch(console.error);
                    const channel = message.guild.channels.cache.get(response.content) || response.mentions.channels.first();
                    if (!channel) return interaction.channel.send({ content: `Aucun salon trouvé pour \`${response.content}\``, allowedMentions: { repliedUser: false } });
                    await client.db.promise().query('INSERT INTO antiraid_logs (guild_id, channel_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE channel_id = ?', 
                        [message.guild.id, channel.id, channel.id]);
                    await displayPage(1);
                }

                async function handleEventSelection(interaction, value) {
                    const eventName = value.split('_')[0];
                    const event = antiraidEvents.flat().find(e => e.name === eventName);
                    if (!event) return;

                    const embed = new EmbedBuilder()
                        .setTitle(`${event.emoji} ・ ${event.name}`)
                        .setColor(process.env.DEFAULT_COLOR);

                    const components = [
                        createSelectMenu(`${event.name}onoff_${message.id}`, "Activité", [
                            { label: `On`, value: event.name + "on_" + message.id, emoji: "✅", description: "Activer: " + event.name },
                            { label: `Off`, value: event.name + "off_" + message.id, emoji: "❌", description: "Désactiver: " + event.name },
                        ]),
                        createSelectMenu(`${event.name}wl_${message.id}`, "Whitelist Bypass", [
                            { label: `WhitelistBypass On`, value: event.name + "wla_" + message.id, emoji: "👤", description: "Activer la whitelist bypass pour: " + event.name },
                            { label: `WhitelistBypass Off`, value: event.name + "wld_" + message.id, emoji: "👥", description: "Désactiver la whitelist bypass pour: " + event.name },
                        ])
                    ];

                    if (!event.sanction) {
                        components.push(createSelectMenu(`${event.name}sanction_${message.id}`, "Sanctions", [
                            { label: `Derank`, value: event.name + "derank_" + message.id, emoji: "👤", description: "Définir la sanction derank pour: " + event.name },
                            { label: `Kick`, value: event.name + "kick_" + message.id, emoji: "⚡", description: "Définir la sanction kick pour: " + event.name },
                            { label: `Ban`, value: event.name + "ban_" + message.id, emoji: "🔌", description: "Définir la sanction ban pour: " + event.name },
                        ]));
                    }

                    components.push(new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId(event.name + "yes_" + message.id)
                            .setEmoji("✅")
                            .setStyle(ButtonStyle.Success),
                        new ButtonBuilder()
                            .setCustomId(event.name + "non_" + message.id)
                            .setEmoji("✖")
                            .setStyle(ButtonStyle.Danger)
                    ));

                    const msg2 = await interaction.channel.send({ embeds: [embed], components });

                    const collector2 = msg2.createMessageComponentCollector({ time: 60000 * 10 });
                    collector2.on("collect", async i2 => {
                        if (i2.user.id !== message.author.id) return;
                        await i2.deferUpdate().catch(console.error);
                        const value2 = i2.values ? i2.values[0] : i2.customId;
                        await handleEventAction(event, value2);
                        if (value2.endsWith("yes_" + message.id)) {
                            await msg2.delete().catch(console.error);
                            await displayPage(antiraidEvents.findIndex(arr => arr.some(e => e.name === event.name)) + 1);
                        } else if (value2.endsWith("non_" + message.id)) {
                            await msg2.delete().catch(console.error);
                        }
                    });
                }

                async function handleEventAction(event, value) {
                    if (value.endsWith("on_" + message.id)) {
                        await client.db.promise().query('UPDATE antiraid SET status = ? WHERE guild_id = ? AND event = ?', [true, message.guild.id, event.db]);
                    } else if (value.endsWith("off_" + message.id)) {
                        await client.db.promise().query('UPDATE antiraid SET status = ? WHERE guild_id = ? AND event = ?', [false, message.guild.id, event.db]);
                    } else if (value.endsWith("wla_" + message.id)) {
                        await client.db.promise().query('UPDATE antiraid SET whitelist = ? WHERE guild_id = ? AND event = ?', [true, message.guild.id, event.db]);
                    } else if (value.endsWith("wld_" + message.id)) {
                        await client.db.promise().query('UPDATE antiraid SET whitelist = ? WHERE guild_id = ? AND event = ?', [false, message.guild.id, event.db]);
                    } else if (value.includes("derank_") || value.includes("kick_") || value.includes("ban_")) {
                        const sanction = value.split('_')[0].replace(event.name, '');
                        await client.db.promise().query('UPDATE antiraid SET sanction = ? WHERE guild_id = ? AND event = ?', [sanction, message.guild.id, event.db]);
                    }
                }

                async function getEventStatus(event) {
                    const [result] = await client.db.promise().query('SELECT status, sanction, whitelist FROM antiraid WHERE guild_id = ? AND event = ?', [message.guild.id, event.db]);
                    const status = result.length > 0 ? (result[0].status ? "`🟢`" : "`🔴`") : "`🔴`";
                    const sanction = event.sanction ? event.sanction : (result.length > 0 ? result[0].sanction : "kick");
                    const whitelist = result.length > 0 ? (result[0].whitelist ? "`🔴`" : "`🟢`") : "`🟢`";
                    return `Actif: ${status}\nSanction: \`${sanction}\`\nWhitelist bypass: ${whitelist}`;
                }

                async function getLogs() {
                    const [result] = await client.db.promise().query('SELECT channel_id FROM antiraid_logs WHERE guild_id = ?', [message.guild.id]);
                    return result.length === 0 || !message.guild.channels.cache.get(result[0].channel_id) ? "`🔴`" : `<#${result[0].channel_id}>`;
                }

                function createSelectMenu(customId, placeholder, options) {
                    return new ActionRowBuilder().addComponents(
                        new StringSelectMenuBuilder()
                            .setCustomId(customId)
                            .setPlaceholder(placeholder)
                            .addOptions(options)
                    );
                }
            }
        } catch (error) {
            console.error("Erreur dans la commande setup:", error);
            message.reply("Une erreur s'est produite lors de l'exécution de la commande.").catch(console.error);
        }
    }
};