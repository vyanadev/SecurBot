const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
    name: "setup",
    aliases: ["antiraid"],
    execute: async (client, message, args, prefix, color) => {
        try {
            const [ownerResult] = await client.db.promise().query('SELECT * FROM bot_owners WHERE user_id = ?', [message.author.id]);
            if (ownerResult.length === 0) return;

            const lgs = { name: "Logs", emoji: "1️⃣", type: 1, db: "logs" };
            const array1 = [
                { name: "Création de rôle", emoji: "2️⃣", db: "rolecreate" },
                { name: "Suppression de rôle", emoji: "3️⃣", db: "roledelete" },
                { name: "Modification de rôle", emoji: "4️⃣", db: "roleedit" },
                { name: "Ajout de rôle avec des permissions dangereuses", emoji: "5️⃣", db: "roleadd" },
            ];
            const array2 = [
                { name: "Création de salon", emoji: "2️⃣", db: "channelcreate" },
                { name: "Suppression de salon", emoji: "3️⃣", db: "channeldelete" },
                { name: "Modification de salon", emoji: "4️⃣", db: "channeledit" },
                { name: "Modification du serveur", emoji: "5️⃣", db: "update" },
            ];
            const array3 = [
                { name: "Création de webhook", emoji: "2️⃣", db: "webhook" },
                { name: "Ajout de bot", emoji: "3️⃣", db: "bot" },
                { name: "Bannissement/Expulsion de membre", emoji: "4️⃣", db: "ban" },
                { name: "Message contenant une invitation discord", emoji: "5️⃣", db: "pub", sanction: "exclusion 5m" },
            ];
            const array4 = [
                { name: "Multiplication de ping", emoji: "2️⃣", db: "ping", sanction: "exclusion 5m" },
                { name: "Multiplication de message", emoji: "3️⃣", db: "spam", sanction: "exclusion 5m" },
                { name: "Déconnexion de membre", emoji: "4️⃣", db: "deco" },
                { name: "Mettre en mute des membres", emoji: "5️⃣", db: "mute" },
            ];
            const tableau = [array1, array2, array3, array4];

            if (args[0] === "on") {
                const msg = await message.reply({ content: `Chargement...`, allowedMentions: { repliedUser: false } });
                for (const array of tableau) {
                    for (const e of array) {
                        await client.db.promise().query('INSERT INTO antiraid (guild_id, event, status, whitelist, sanction) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE status = ?, whitelist = ?, sanction = ?', 
                            [message.guild.id, e.db, true, false, "derank", true, false, "derank"]);
                    }
                }
                msg.edit({ content: "Tous les événements d'antiraid ont été activés", allowedMentions: { repliedUser: false } });
            } else if (args[0] === "off") {
                const msg = await message.reply({ content: `Chargement...`, allowedMentions: { repliedUser: false } });
                for (const array of tableau) {
                    for (const e of array) {
                        await client.db.promise().query('UPDATE antiraid SET status = ? WHERE guild_id = ? AND event = ?', 
                            [false, message.guild.id, e.db]);
                    }
                }
                msg.edit({ content: "Tous les événements d'antiraid ont été désactivés", allowedMentions: { repliedUser: false } });
            } else if (args[0] === "max") {
                const msg = await message.reply({ content: `Chargement...`, allowedMentions: { repliedUser: false } });
                for (const array of tableau) {
                    for (const e of array) {
                        await client.db.promise().query('INSERT INTO antiraid (guild_id, event, status, whitelist, sanction) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE status = ?, whitelist = ?, sanction = ?', 
                            [message.guild.id, e.db, true, true, "ban", true, true, "ban"]);
                    }
                }
                msg.edit({ content: "Tous les événements d'antiraid ont été activés en `max`", allowedMentions: { repliedUser: false } });
            } else if (args[0] === "config" || !args[0]) {
                const msg = await message.reply({ content: `Chargement...`, allowedMentions: { repliedUser: false } });
                await page1();
                setTimeout(() => {
                    message.delete().catch(console.error);
                    msg.delete().catch(console.error);
                }, 60000 * 10);

                const collector = msg.createMessageComponentCollector({ time: 60000 * 10 });
                collector.on("collect", async i => {
                    if (i.user.id !== message.author.id) return;
                    await i.deferUpdate().catch(console.error);
                    if (i.customId === "antiraid4_" + message.id) {
                        await page4();
                    } else if (i.customId === "antiraid3_" + message.id) {
                        await page3();
                    } else if (i.customId === "antiraid2_" + message.id) {
                        await page2();
                    } else if (i.customId === "antiraid1_" + message.id) {
                        await page1();
                    } else if (i.isStringSelectMenu()) {
                        const value = i.values[0];
                        if (value === "Logs") {
                            const embed = new EmbedBuilder()
                                .setColor(process.env.DEFAULT_COLOR)
                                .setDescription(`Quel est **le nouveau salon de logs** ?`);
                            const msg2 = await i.channel.send({ embeds: [embed] });
                            const filter = m => m.author.id === i.user.id;
                            const collected = await msg2.channel.awaitMessages({ filter, max: 1, time: 60000 * 10, errors: ["time"] });
                            const response = collected.first();
                            await msg2.delete().catch(console.error);
                            await response.delete().catch(console.error);
                            const channel = message.guild.channels.cache.get(response.content) || response.mentions.channels.first();
                            if (!channel) return i.channel.send({ content: `Aucun salon trouvé pour \`${response.content}\``, allowedMentions: { repliedUser: false } });
                            await client.db.promise().query('INSERT INTO antiraid_logs (guild_id, channel_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE channel_id = ?', 
                                [message.guild.id, channel.id, channel.id]);
                            await page1();
                        } else {
                            for (const array of tableau) {
                                for (const e of array) {
                                    if (value === e.name + "_" + message.id) {
                                        const menu = new ActionRowBuilder()
                                            .addComponents(
                                                new StringSelectMenuBuilder()
                                                    .setCustomId(`${e.name}onoff_${message.id}`)
                                                    .setPlaceholder("Activité")
                                                    .addOptions([
                                                        { label: `On`, value: e.name + "on_" + message.id, emoji: "✅", description: "Activer: " + e.name },
                                                        { label: `Off`, value: e.name + "off_" + message.id, emoji: "❌", description: "Désactiver: " + e.name },
                                                    ])
                                            );
                                        const menu2 = new ActionRowBuilder()
                                            .addComponents(
                                                new StringSelectMenuBuilder()
                                                    .setCustomId(`${e.name}wl_${message.id}`)
                                                    .setPlaceholder("Whitelist Bypass")
                                                    .addOptions([
                                                        { label: `WhitelistBypass On`, value: e.name + "wla_" + message.id, emoji: "👤", description: "Activer la whitelist bypass pour: " + e.name },
                                                        { label: `WhitelistBypass Off`, value: e.name + "wld_" + message.id, emoji: "👥", description: "Désactiver la whitelist bypass pour: " + e.name },
                                                    ])
                                            );
                                        const menu3 = new ActionRowBuilder()
                                            .addComponents(
                                                new StringSelectMenuBuilder()
                                                    .setCustomId(`${e.name}sanction_${message.id}`)
                                                    .setPlaceholder("Sanctions")
                                                    .addOptions([
                                                        { label: `Derank`, value: e.name + "derank_" + message.id, emoji: "👤", description: "Définir la sanction derank pour: " + e.name },
                                                        { label: `Kick`, value: e.name + "kick_" + message.id, emoji: "⚡", description: "Définir la sanction kick pour: " + e.name },
                                                        { label: `Ban`, value: e.name + "ban_" + message.id, emoji: "🔌", description: "Définir la sanction ban pour: " + e.name },
                                                    ])
                                            );
                                        const btn = new ActionRowBuilder()
                                            .addComponents(
                                                new ButtonBuilder()
                                                    .setCustomId(e.name + "yes_" + message.id)
                                                    .setEmoji("✅")
                                                    .setStyle(ButtonStyle.Success),
                                                new ButtonBuilder()
                                                    .setCustomId(e.name + "non_" + message.id)
                                                    .setEmoji("✖")
                                                    .setStyle(ButtonStyle.Danger)
                                            );
                                        const embed = new EmbedBuilder()
                                            .setTitle(`${e.emoji} ・ ${e.name}`)
                                            .setColor(process.env.DEFAULT_COLOR);
                                        let msg2;
                                        if (e.sanction) {
                                            msg2 = await i.channel.send({ embeds: [embed], components: [menu, menu2, btn] });
                                        } else {
                                            msg2 = await i.channel.send({ embeds: [embed], components: [menu, menu2, menu3, btn] });
                                        }
                                        const collector2 = msg2.createMessageComponentCollector({ time: 60000 * 10 });
                                        collector2.on("collect", async i2 => {
                                            if (i2.user.id !== message.author.id) return;
                                            await i2.deferUpdate().catch(console.error);
                                            const value2 = i2.values ? i2.values[0] : i2.customId;
                                            if (value2 === e.name + "on_" + message.id) {
                                                await client.db.promise().query('UPDATE antiraid SET status = ? WHERE guild_id = ? AND event = ?', [true, message.guild.id, e.db]);
                                            } else if (value2 === e.name + "off_" + message.id) {
                                                await client.db.promise().query('UPDATE antiraid SET status = ? WHERE guild_id = ? AND event = ?', [false, message.guild.id, e.db]);
                                            } else if (value2 === e.name + "wla_" + message.id) {
                                                await client.db.promise().query('UPDATE antiraid SET whitelist = ? WHERE guild_id = ? AND event = ?', [true, message.guild.id, e.db]);
                                            } else if (value2 === e.name + "wld_" + message.id) {
                                                await client.db.promise().query('UPDATE antiraid SET whitelist = ? WHERE guild_id = ? AND event = ?', [false, message.guild.id, e.db]);
                                            } else if (value2 === e.name + "derank_" + message.id || value2 === e.name + "kick_" + message.id || value2 === e.name + "ban_" + message.id) {
                                                const sanction = value2.split('_')[0].replace(e.name, '');
                                                await client.db.promise().query('UPDATE antiraid SET sanction = ? WHERE guild_id = ? AND event = ?', [sanction, message.guild.id, e.db]);
                                            } else if (value2 === e.name + "yes_" + message.id) {
                                                await msg2.delete().catch(console.error);
                                                if (array1.some(i => i.name === e.name)) await page1();
                                                else if (array2.some(i => i.name === e.name)) await page2();
                                                else if (array3.some(i => i.name === e.name)) await page3();
                                                else if (array4.some(i => i.name === e.name)) await page4();
                                            } else if (value2 === e.name + "non_" + message.id) {
                                                await msg2.delete().catch(console.error);
                                            }
                                        });
                                    }
                                }
                            }
                        }
                    }
                });

                async function all(e) {
                    const [result] = await client.db.promise().query('SELECT status, sanction, whitelist FROM antiraid WHERE guild_id = ? AND event = ?', [message.guild.id, e.db]);
                    const event1 = result.length > 0 ? (result[0].status ? "`🟢`" : "`🔴`") : "`🔴`";
                    const event2 = e.sanction ? e.sanction : (result.length > 0 ? result[0].sanction : "kick");
                    const event3 = result.length > 0 ? (result[0].whitelist ? "`🔴`" : "`🟢`") : "`🟢`";
                    return `Actif: ${event1}\nSanction: \`${event2}\`\nWhitelist bypass: ${event3}`;
                }

                async function logs(name) {
                    const [result] = await client.db.promise().query('SELECT channel_id FROM antiraid_logs WHERE guild_id = ?', [message.guild.id]);
                    if (result.length === 0 || !message.guild.channels.cache.get(result[0].channel_id)) return "`🔴`";
                    return `<#${result[0].channel_id}>`;
                }

                async function page1() {
                    let array_menu = [];
                    let array_fields = [];
                    array_fields.push({ name: `${lgs.emoji} ・ ${lgs.name}`, value: `Salon: ${await logs(lgs.db)}` });
                    array_menu.push({ label: `${lgs.name}`, value: lgs.name, emoji: lgs.emoji });
                    for (const e of array1) {
                        array_fields.push({ name: `${e.emoji} ・ ${e.name}`, value: await all(e) });
                        array_menu.push({ label: e.name, value: e.name + "_" + message.id, emoji: e.emoji });
                    }
                    array_menu.push({ label: "Annuler", value: "Annuler", emoji: "❌" });
                    const menu = new ActionRowBuilder()
                        .addComponents(
                            new StringSelectMenuBuilder()
                                .setCustomId(`menu1_${message.id}`)
                                .setPlaceholder("Faites un choix")
                                .addOptions(array_menu)
                        );

                    const btn = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId("antiraid4_" + message.id)
                                .setLabel("◀")
                                .setStyle(ButtonStyle.Primary),
                            new ButtonBuilder()
                                .setCustomId("antiraid2_" + message.id)
                                .setLabel("▶")
                                .setStyle(ButtonStyle.Primary)
                        );

                    const embed = new EmbedBuilder()
                        .setTitle(`Configuration des événements d'antiraid`)
                        .setColor(process.env.DEFAULT_COLOR)
                        .addFields(array_fields)
                        .setFooter({ text: `1 / 4` });
                    await msg.edit({ content: null, embeds: [embed], components: [menu, btn] });
                }

                async function page2() {
                    let array_menu = [];
                    let array_fields = [];
                    array_fields.push({ name: `${lgs.emoji} ・ ${lgs.name}`, value: `Salon: ${await logs(lgs.db)}` });
                    array_menu.push({ label: `${lgs.name}`, value: lgs.name, emoji: lgs.emoji });
                    for (const e of array2) {
                        array_fields.push({ name: `${e.emoji} ・ ${e.name}`, value: await all(e) });
                        array_menu.push({ label: e.name, value: e.name + "_" + message.id, emoji: e.emoji });
                    }
                    array_menu.push({ label: "Annuler", value: "Annuler", emoji: "❌" });
                    const menu = new ActionRowBuilder()
                        .addComponents(
                            new StringSelectMenuBuilder()
                                .setCustomId(`menu2_${message.id}`)
                                .setPlaceholder("Faites un choix")
                                .addOptions(array_menu)
                        );
                
                    const btn = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId("antiraid1_" + message.id)
                                .setLabel("◀")
                                .setStyle(ButtonStyle.Primary),
                            new ButtonBuilder()
                                .setCustomId("antiraid3_" + message.id)
                                .setLabel("▶")
                                .setStyle(ButtonStyle.Primary)
                        );
                
                    const embed = new EmbedBuilder()
                        .setTitle(`Configuration des événements d'antiraid`)
                        .setColor(process.env.DEFAULT_COLOR)
                        .addFields(array_fields)
                        .setFooter({ text: `2 / 4` });
                    await msg.edit({ content: null, embeds: [embed], components: [menu, btn] });
                }
                
                async function page3() {
                    let array_menu = [];
                    let array_fields = [];
                    array_fields.push({ name: `${lgs.emoji} ・ ${lgs.name}`, value: `Salon: ${await logs(lgs.db)}` });
                    array_menu.push({ label: `${lgs.name}`, value: lgs.name, emoji: lgs.emoji });
                    for (const e of array3) {
                        array_fields.push({ name: `${e.emoji} ・ ${e.name}`, value: await all(e) });
                        array_menu.push({ label: e.name, value: e.name + "_" + message.id, emoji: e.emoji });
                    }
                    array_menu.push({ label: "Annuler", value: "Annuler", emoji: "❌" });
                    const menu = new ActionRowBuilder()
                        .addComponents(
                            new StringSelectMenuBuilder()
                                .setCustomId(`menu3_${message.id}`)
                                .setPlaceholder("Faites un choix")
                                .addOptions(array_menu)
                        );
                
                    const btn = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId("antiraid2_" + message.id)
                                .setLabel("◀")
                                .setStyle(ButtonStyle.Primary),
                            new ButtonBuilder()
                                .setCustomId("antiraid4_" + message.id)
                                .setLabel("▶")
                                .setStyle(ButtonStyle.Primary)
                        );
                
                    const embed = new EmbedBuilder()
                        .setTitle(`Configuration des événements d'antiraid`)
                        .setColor(process.env.DEFAULT_COLOR)
                        .addFields(array_fields)
                        .setFooter({ text: `3 / 4` });
                    await msg.edit({ content: null, embeds: [embed], components: [menu, btn] });
                }
                
                async function page4() {
                    let array_menu = [];
                    let array_fields = [];
                    array_fields.push({ name: `${lgs.emoji} ・ ${lgs.name}`, value: `Salon: ${await logs(lgs.db)}` });
                    array_menu.push({ label: `${lgs.name}`, value: lgs.name, emoji: lgs.emoji });
                    for (const e of array4) {
                        array_fields.push({ name: `${e.emoji} ・ ${e.name}`, value: await all(e) });
                        array_menu.push({ label: e.name, value: e.name + "_" + message.id, emoji: e.emoji });
                    }
                    array_menu.push({ label: "Annuler", value: "Annuler", emoji: "❌" });
                    const menu = new ActionRowBuilder()
                        .addComponents(
                            new StringSelectMenuBuilder()
                                .setCustomId(`menu4_${message.id}`)
                                .setPlaceholder("Faites un choix")
                                .addOptions(array_menu)
                        );
                
                    const btn = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId("antiraid3_" + message.id)
                                .setLabel("◀")
                                .setStyle(ButtonStyle.Primary),
                            new ButtonBuilder()
                                .setCustomId("antiraid1_" + message.id)
                                .setLabel("▶")
                                .setStyle(ButtonStyle.Primary)
                        );
                
                    const embed = new EmbedBuilder()
                        .setTitle(`Configuration des événements d'antiraid`)
                        .setColor(process.env.DEFAULT_COLOR)
                        .addFields(array_fields)
                        .setFooter({ text: `4 / 4` });
                    await msg.edit({ content: null, embeds: [embed], components: [menu, btn] });
                }

                await page1();
            }
        } catch (error) {
            console.error("Erreur dans la commande setup:", error);
            message.reply("Une erreur s'est produite lors de l'exécution de la commande.").catch(console.error);
        }
    }
};