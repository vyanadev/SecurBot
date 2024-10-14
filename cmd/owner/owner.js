const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'owner',
    aliases: ["owners"],
    execute: async (client, message, args, prefix, color) => {
        const isOwner = process.env.OWNER_IDS.split(',').includes(message.author.id);
        if (!isOwner) return;

        if (args[0] === "add") {
            let member = args[1] ? await client.users.fetch(args[1]).catch(() => null) : null;
            if (!member && message.mentions.users.first()) member = message.mentions.users.first();
            if (!member) return message.reply({ content: `Aucun membre trouvé pour \`${args[1] || "❌"}\``, allowedMentions: { repliedUser: false } });

            const [existingOwner] = await client.db.promise().query('SELECT * FROM bot_owners WHERE user_id = ?', [member.id]);
            if (existingOwner.length > 0) return message.reply({ content: `${member.username} est déjà owner`, allowedMentions: { repliedUser: false } });

            await client.db.promise().query('INSERT INTO bot_owners (user_id, is_owner) VALUES (?, true)', [member.id]);
            return message.reply({ content: `${member.username} est maintenant owner`, allowedMentions: { repliedUser: false } });

        } else if (args[0] === "clear") {
            const [result] = await client.db.promise().query('DELETE FROM bot_owners WHERE user_id NOT IN (?)', [process.env.OWNER_IDS.split(',')]);
            return message.reply({ content: `${result.affectedRows} ${result.affectedRows > 1 ? "personnes ont été supprimées" : "personne a été supprimée"} des owners`, allowedMentions: { repliedUser: false } });

        } else if (args[0] === "remove") {
            let member = args[1] ? await client.users.fetch(args[1]).catch(() => null) : null;
            if (!member && message.mentions.users.first()) member = message.mentions.users.first();
            if (!member) return message.reply({ content: `Aucun membre trouvé pour \`${args[1] || "❌"}\``, allowedMentions: { repliedUser: false } });

            const [existingOwner] = await client.db.promise().query('SELECT * FROM bot_owners WHERE user_id = ?', [member.id]);
            if (existingOwner.length === 0) return message.reply({ content: `${member.username} n'est pas owner`, allowedMentions: { repliedUser: false } });

            await client.db.promise().query('DELETE FROM bot_owners WHERE user_id = ?', [member.id]);
            return message.reply({ content: `${member.username} n'est plus owner`, allowedMentions: { repliedUser: false } });

        } else if (args[0] === "list") {
            const [owners] = await client.db.promise().query('SELECT user_id FROM bot_owners');
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

            const msg = await message.reply({ content: `Chargement...`, allowedMentions: { repliedUser: false } });

            if (owners.length > count) {
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
                    interaction.deferUpdate();

                    if (interaction.customId === `prev_${message.id}`) {
                        page--;
                        currentIndex -= count;
                        if (currentIndex < 0) {
                            currentIndex = owners.length - count;
                            page = Math.ceil(owners.length / count);
                        }
                    } else if (interaction.customId === `next_${message.id}`) {
                        page++;
                        currentIndex += count;
                        if (currentIndex >= owners.length) {
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