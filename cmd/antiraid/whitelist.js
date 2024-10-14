const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'whitelist',
    aliases: ["wl"],
    execute: async (client, message, args, prefix, color) => {
        try {
            const [ownerResult] = await client.db.promise().query('SELECT * FROM bot_owners WHERE user_id = ?', [message.author.id]);
            if (ownerResult.length === 0) return;

            if (args[0] === "add") {
                let member = args[1] ? await client.users.fetch(args[1]).catch(() => null) : null;
                if (!member && message.mentions.users.first()) member = message.mentions.users.first();
                if (!member) return message.reply({ content: `Aucun membre trouvé pour \`${args[1] || "❌"}\``, allowedMentions: { repliedUser: false } });

                const [whitelisted] = await client.db.promise().query('SELECT * FROM whitelist WHERE guild_id = ? AND user_id = ?', [message.guild.id, member.id]);
                if (whitelisted.length > 0) return message.reply({ content: `${member.username} est déjà whitelist`, allowedMentions: { repliedUser: false } });

                await client.db.promise().query('INSERT INTO whitelist (guild_id, user_id) VALUES (?, ?)', [message.guild.id, member.id]);
                return message.reply({ content: `${member.username} est maintenant whitelist`, allowedMentions: { repliedUser: false } });

            } else if (args[0] === "clear") {
                const [result] = await client.db.promise().query('DELETE FROM whitelist WHERE guild_id = ?', [message.guild.id]);
                return message.reply({ content: `${result.affectedRows} ${result.affectedRows > 1 ? "personnes ont été supprimées" : "personne a été supprimée"} de la whitelist`, allowedMentions: { repliedUser: false } });

            } else if (args[0] === "remove") {
                let member = args[1] ? await client.users.fetch(args[1]).catch(() => null) : null;
                if (!member && message.mentions.users.first()) member = message.mentions.users.first();
                if (!member) return message.reply({ content: `Aucun membre trouvé pour \`${args[1] || "❌"}\``, allowedMentions: { repliedUser: false } });

                const [whitelisted] = await client.db.promise().query('SELECT * FROM whitelist WHERE guild_id = ? AND user_id = ?', [message.guild.id, member.id]);
                if (whitelisted.length === 0) return message.reply({ content: `${member.username} n'est pas whitelist`, allowedMentions: { repliedUser: false } });

                await client.db.promise().query('DELETE FROM whitelist WHERE guild_id = ? AND user_id = ?', [message.guild.id, member.id]);
                return message.reply({ content: `${member.username} n'est plus whitelist`, allowedMentions: { repliedUser: false } });

            } else if (args[0] === "list") {
                const [whitelisted] = await client.db.promise().query('SELECT user_id FROM whitelist WHERE guild_id = ?', [message.guild.id]);
                const count = 15;
                let page = 1;

                const generateEmbed = (start) => {
                    const current = whitelisted.slice(start, start + count);
                    const embed = new EmbedBuilder()
                        .setTitle(`Whitelist`)
                        .setFooter({ text: `${page} / ${Math.ceil(whitelisted.length / count) || 1}` })
                        .setColor(color)
                        .setDescription(current.map(user => `<@${user.user_id}>`).join('\n') || "Aucune donnée trouvée");
                    return embed;
                };

                const msg = await message.reply({ content: `Chargement...`, allowedMentions: { repliedUser: false } });

                if (whitelisted.length > count) {
                    const row = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId(`prev_${message.id}`)
                                .setLabel('◀')
                                .setStyle(ButtonStyle.Primary),
                            new ButtonBuilder()
                                .setCustomId(`next_${message.id}`)
                                .setLabel('▶')
                                .setStyle(ButtonStyle.Primary)
                        );

                    await msg.edit({ content: null, embeds: [generateEmbed(0)], components: [row] });

                    const collector = msg.createMessageComponentCollector({ time: 60000 * 5 });

                    let currentIndex = 0;
                    collector.on('collect', async interaction => {
                        if (interaction.user.id !== message.author.id) return;
                        await interaction.deferUpdate();

                        if (interaction.customId === `prev_${message.id}`) {
                            page--;
                            currentIndex -= count;
                            if (currentIndex < 0) {
                                currentIndex = whitelisted.length - count;
                                page = Math.ceil(whitelisted.length / count);
                            }
                        } else if (interaction.customId === `next_${message.id}`) {
                            page++;
                            currentIndex += count;
                            if (currentIndex >= whitelisted.length) {
                                currentIndex = 0;
                                page = 1;
                            }
                        }

                        await msg.edit({ embeds: [generateEmbed(currentIndex)], components: [row] });
                    });

                    collector.on('end', () => {
                        msg.edit({ components: [] });
                    });
                } else {
                    msg.edit({ content: null, embeds: [generateEmbed(0)] });
                }
            }
        } catch (error) {
            console.error("Erreur dans la commande whitelist:", error);
            message.reply("Une erreur s'est produite lors de l'exécution de la commande.").catch(console.error);
        }
    }
};