const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
    name: "verify",
    description: "Configurer le système de vérification",
    execute: async (client, message, args, prefix, color) => {
        try {
            const [ownerResult] = await client.db.promise().query('SELECT * FROM bot_owners WHERE user_id = ?', [message.author.id]);
            if (ownerResult.length === 0) return;

            const verifyOptions = [
                { name: "Activer/Désactiver", emoji: "1️⃣", db: "verify_status" },
                { name: "Canal de vérification", emoji: "2️⃣", db: "verify_channel" },
                { name: "Rôle après vérification", emoji: "3️⃣", db: "verify_role" },
                { name: "Message de vérification", emoji: "4️⃣", db: "verify_message" },
                { name: "Type de vérification", emoji: "5️⃣", db: "verify_type" }
            ];

            if (args[0] === "on") {
                const msg = await message.reply({ content: `Chargement...`, allowedMentions: { repliedUser: false } });
                await client.db.promise().query('INSERT INTO verify_settings (guild_id, status) VALUES (?, ?) ON DUPLICATE KEY UPDATE status = ?', 
                    [message.guild.id, true, true]);
                msg.edit({ content: "Le système de vérification a été activé", allowedMentions: { repliedUser: false } });
            } else if (args[0] === "off") {
                const msg = await message.reply({ content: `Chargement...`, allowedMentions: { repliedUser: false } });
                await client.db.promise().query('UPDATE verify_settings SET status = ? WHERE guild_id = ?', 
                    [false, message.guild.id]);
                msg.edit({ content: "Le système de vérification a été désactivé", allowedMentions: { repliedUser: false } });
            } else {
                const msg = await message.reply({ content: `Chargement...`, allowedMentions: { repliedUser: false } });
                await displayVerifySettings();
                setTimeout(() => {
                    message.delete().catch(console.error);
                    msg.delete().catch(console.error);
                }, 60000 * 5);

                const collector = msg.createMessageComponentCollector({ time: 60000 * 5 });
                collector.on("collect", async i => {
                    if (i.user.id !== message.author.id) return;
                    await i.deferUpdate().catch(console.error);
                    if (i.isStringSelectMenu()) {
                        const [selectedOption] = verifyOptions.filter(opt => opt.name + "_" + message.id === i.values[0]);
                        if (selectedOption) {
                            await handleOptionSelection(selectedOption, i);
                        }
                    }
                });

                async function displayVerifySettings() {
                    const [settings] = await client.db.promise().query('SELECT * FROM verify_settings WHERE guild_id = ?', [message.guild.id]);
                    let array_fields = [];
                    let array_menu = [];

                    for (const option of verifyOptions) {
                        const value = settings.length > 0 ? settings[0][option.db] : null;
                        array_fields.push({ name: `${option.emoji} ・ ${option.name}`, value: formatSettingValue(option.db, value) });
                        array_menu.push({ label: option.name, value: option.name + "_" + message.id, emoji: option.emoji });
                    }

                    const menu = new ActionRowBuilder()
                        .addComponents(
                            new StringSelectMenuBuilder()
                                .setCustomId(`verify_menu_${message.id}`)
                                .setPlaceholder("Choisissez une option à configurer")
                                .addOptions(array_menu)
                        );

                    const embed = new EmbedBuilder()
                        .setTitle(`Configuration du système de vérification`)
                        .setColor(color)
                        .addFields(array_fields);

                    await msg.edit({ content: null, embeds: [embed], components: [menu] });
                }

                function formatSettingValue(setting, value) {
                    switch (setting) {
                        case "verify_status":
                            return value ? "`🟢 Activé`" : "`🔴 Désactivé`";
                        case "verify_channel":
                            return value ? `<#${value}>` : "`Non configuré`";
                        case "verify_role":
                            return value ? `<@&${value}>` : "`Non configuré`";
                        case "verify_message":
                            return value ? `\`${value.substring(0, 50)}...\`` : "`Message par défaut`";
                        case "verify_type":
                            return value || "`Bouton (par défaut)`";
                        default:
                            return "`Non configuré`";
                    }
                }

                async function handleOptionSelection(option, interaction) {
                    const embed = new EmbedBuilder().setColor(color);
                    let promptMessage, filter, collected;
                
                    switch (option.db) {
                        case "verify_status":
                            const menu = new ActionRowBuilder()
                                .addComponents(
                                    new StringSelectMenuBuilder()
                                        .setCustomId(`verify_status_${message.id}`)
                                        .setPlaceholder("Choisissez un statut")
                                        .addOptions([
                                            { label: "Activer", value: "true", emoji: "🟢" },
                                            { label: "Désactiver", value: "false", emoji: "🔴" }
                                        ])
                                );
                            await interaction.message.edit({ embeds: [embed.setDescription("Choisissez le statut du système de vérification.")], components: [menu] });
                            
                            const statusCollector = interaction.message.createMessageComponentCollector({ time: 30000 });
                            statusCollector.on("collect", async i => {
                                if (i.user.id !== message.author.id) return;
                                const newStatus = i.values[0] === "true";
                                await client.db.promise().query('UPDATE verify_settings SET verify_status = ? WHERE guild_id = ?', [newStatus, message.guild.id]);
                                await i.update({ content: `Le système de vérification a été ${newStatus ? "activé" : "désactivé"}.`, components: [] });
                                statusCollector.stop();
                            });
                            break;
                
                        case "verify_channel":
                            promptMessage = await interaction.message.edit({ embeds: [embed.setDescription("Mentionnez le canal de vérification ou entrez son ID.")], components: [] });
                            filter = m => m.author.id === message.author.id;
                            collected = await promptMessage.channel.awaitMessages({ filter, max: 1, time: 30000, errors: ["time"] });
                            if (collected.size > 0) {
                                const channel = collected.first().mentions.channels.first() || message.guild.channels.cache.get(collected.first().content);
                                if (channel) {
                                    await client.db.promise().query('UPDATE verify_settings SET verify_channel = ? WHERE guild_id = ?', [channel.id, message.guild.id]);
                                    await interaction.message.edit({ content: `Le canal de vérification a été défini sur ${channel}.`, embeds: [], components: [] });
                                } else {
                                    await interaction.message.edit({ content: "Canal invalide. Veuillez réessayer.", embeds: [], components: [] });
                                }
                            }
                            break;
                
                        case "verify_role":
                            promptMessage = await interaction.message.edit({ embeds: [embed.setDescription("Mentionnez le rôle à attribuer après vérification ou entrez son ID.")], components: [] });
                            filter = m => m.author.id === message.author.id;
                            collected = await promptMessage.channel.awaitMessages({ filter, max: 1, time: 30000, errors: ["time"] });
                            if (collected.size > 0) {
                                const role = collected.first().mentions.roles.first() || message.guild.roles.cache.get(collected.first().content);
                                if (role) {
                                    await client.db.promise().query('UPDATE verify_settings SET verify_role = ? WHERE guild_id = ?', [role.id, message.guild.id]);
                                    await interaction.message.edit({ content: `Le rôle de vérification a été défini sur ${role}.`, embeds: [], components: [] });
                                } else {
                                    await interaction.message.edit({ content: "Rôle invalide. Veuillez réessayer.", embeds: [], components: [] });
                                }
                            }
                            break;
                
                        case "verify_message":
                            promptMessage = await interaction.message.edit({ embeds: [embed.setDescription("Entrez le message de vérification que vous souhaitez afficher.")], components: [] });
                            filter = m => m.author.id === message.author.id;
                            collected = await promptMessage.channel.awaitMessages({ filter, max: 1, time: 60000, errors: ["time"] });
                            if (collected.size > 0) {
                                const newMessage = collected.first().content;
                                await client.db.promise().query('UPDATE verify_settings SET verify_message = ? WHERE guild_id = ?', [newMessage, message.guild.id]);
                                await interaction.message.edit({ content: "Le message de vérification a été mis à jour.", embeds: [], components: [] });
                            }
                            break;
                
                        case "verify_type":
                            const typeMenu = new ActionRowBuilder()
                                .addComponents(
                                    new StringSelectMenuBuilder()
                                        .setCustomId(`verify_type_${message.id}`)
                                        .setPlaceholder("Choisissez un type de vérification")
                                        .addOptions([
                                            { label: "Bouton", value: "button", emoji: "🔘" },
                                            { label: "Captcha", value: "captcha", emoji: "🔢" },
                                            { label: "Réaction", value: "reaction", emoji: "👍" }
                                        ])
                                );
                            await interaction.message.edit({ embeds: [embed.setDescription("Choisissez le type de vérification.")], components: [typeMenu] });
                            
                            const typeCollector = interaction.message.createMessageComponentCollector({ time: 30000 });
                            typeCollector.on("collect", async i => {
                                if (i.user.id !== message.author.id) return;
                                await client.db.promise().query('UPDATE verify_settings SET verify_type = ? WHERE guild_id = ?', [i.values[0], message.guild.id]);
                                await i.update({ content: `Le type de vérification a été défini sur ${i.values[0]}.`, components: [] });
                                typeCollector.stop();
                            });
                            break;
                    }
                }
                    setTimeout(async () => {
                        await displayVerifySettings();
                    }, 3000);
                }
        } catch (error) {
            console.error("Erreur dans la commande verify:", error);
            message.reply("Une erreur s'est produite lors de l'exécution de la commande.").catch(console.error);
        }
    }
};