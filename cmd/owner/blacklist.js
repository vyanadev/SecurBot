const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'blacklist',
    aliases: ["bl"],
    execute: async (client, message, args, prefix, color) => {
        const [ownerResult] = await client.db.promise().query('SELECT * FROM bot_owners WHERE user_id = ?', [message.author.id]);
        if (ownerResult.length === 0) return;

        if (args[0] === "add") {
            let member = args[1] ? await client.users.fetch(args[1]).catch(() => null) : null;
            if (!member && message.mentions.users.first()) member = message.mentions.users.first();
            if (!member) return message.reply({ content: `Aucun membre trouvé pour \`${args[1] || "❌"}\``, allowedMentions: { repliedUser: false } });

            const [blacklisted] = await client.db.promise().query('SELECT * FROM blacklist WHERE user_id = ?', [member.id]);
            if (blacklisted.length > 0) return message.reply({ content: `${member.username} est déjà blacklist`, allowedMentions: { repliedUser: false } });

            await client.db.promise().query('INSERT INTO blacklist (user_id) VALUES (?)', [member.id]);
            return message.reply({ content: `${member.username} est maintenant blacklist`, allowedMentions: { repliedUser: false } });

        } else if (args[0] === "clear") {
            const [result] = await client.db.promise().query('DELETE FROM blacklist');
            return message.reply({ content: `${result.affectedRows} ${result.affectedRows > 1 ? "personnes ont été supprimées" : "personne a été supprimée"} de la blacklist`, allowedMentions: { repliedUser: false } });

        } else if (args[0] === "remove") {
            let member = args[1] ? await client.users.fetch(args[1]).catch(() => null) : null;
            if (!member && message.mentions.users.first()) member = message.mentions.users.first();
            if (!member) return message.reply({ content: `Aucun membre trouvé pour \`${args[1] || "❌"}\``, allowedMentions: { repliedUser: false } });

            const [blacklisted] = await client.db.promise().query('SELECT * FROM blacklist WHERE user_id = ?', [member.id]);
            if (blacklisted.length === 0) return message.reply({ content: `${member.username} n'est pas blacklist`, allowedMentions: { repliedUser: false } });

            await client.db.promise().query('DELETE FROM blacklist WHERE user_id = ?', [member.id]);
            return message.reply({ content: `${member.username} n'est plus blacklist`, allowedMentions: { repliedUser: false } });

        } else if (args[0] === "list") {
            const [blacklisted] = await client.db.promise().query('SELECT user_id FROM blacklist');
            const count = 15;
            let page = 1;

            const generateEmbed = (start) => {
                const current = blacklisted.slice(start, start + count);
                const embed = new EmbedBuilder()
                    .setTitle(`Blacklist`)
                    .setFooter({ text: `${page} / ${Math.ceil(blacklisted.length / count) || 1}` })
                    .setColor(process.env.DEFAULT_COLOR)
                    .setDescription(current.map(user => `<@${user.user_id}>`).join('\n') || "Aucune donnée trouvée");
                return embed;
            };

            const msg = await message.reply({ content: `Chargement...`, allowedMentions: { repliedUser: false } });

            if (blacklisted.length > count) {
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
                            currentIndex = blacklisted.length - count;
                            page = Math.ceil(blacklisted.length / count);
                        }
                    } else if (interaction.customId === `next_${message.id}`) {
                        page++;
                        currentIndex += count;
                        if (currentIndex >= blacklisted.length) {
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
    }
};