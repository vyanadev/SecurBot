const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'blacklist',
    description: "Permet de blacklist un utilisateur.",
    aliases: ["bl"],
    usage: `[add/clear/remove/list]`,
    cooldowns: 10,
    execute: async (client, message, args, prefix, color) => {
        // Vérifier si l'utilisateur est un propriétaire du bot
        const [ownerResult] = await client.db.promise().query('SELECT COUNT(*) AS count FROM bot_owners WHERE user_id = ?', [message.author.id]);
        if (ownerResult[0].count === 0) return;

        const subcommand = args[0];
        const userId = args[1];

        if (subcommand === "add") {
            // Récupérer le membre à ajouter
            const member = userId ? await client.users.fetch(userId).catch(() => null) : message.mentions.users.first();
            if (!member) return message.reply({ content: `Aucun membre trouvé pour \`${userId || "❌"}\``, allowedMentions: { repliedUser: false } });

            // Vérifier si le membre est déjà blacklist
            const [blacklisted] = await client.db.promise().query('SELECT COUNT(*) AS count FROM blacklist WHERE user_id = ?', [member.id]);
            if (blacklisted[0].count > 0) return message.reply({ content: `${member.username} est déjà blacklist`, allowedMentions: { repliedUser: false } });

            // Ajouter le membre à la blacklist
            await client.db.promise().query('INSERT INTO blacklist (user_id) VALUES (?)', [member.id]);
            return message.reply({ content: `${member.username} est maintenant blacklist`, allowedMentions: { repliedUser: false } });

        } else if (subcommand === "clear") {
            // Supprimer tous les membres de la blacklist
            const [result] = await client.db.promise().query('DELETE FROM blacklist');
            const count = result.affectedRows;
            return message.reply({ content: `${count} ${count > 1 ? "personnes ont été supprimées" : "personne a été supprimée"} de la blacklist`, allowedMentions: { repliedUser: false } });

        } else if (subcommand === "remove") {
            // Récupérer le membre à supprimer
            const member = userId ? await client.users.fetch(userId).catch(() => null) : message.mentions.users.first();
            if (!member) return message.reply({ content: `Aucun membre trouvé pour \`${userId || "❌"}\``, allowedMentions: { repliedUser: false } });

            // Vérifier si le membre est blacklist
            const [blacklisted] = await client.db.promise().query('SELECT COUNT(*) AS count FROM blacklist WHERE user_id = ?', [member.id]);
            if (blacklisted[0].count === 0) return message.reply({ content: `${member.username} n'est pas blacklist`, allowedMentions: { repliedUser: false } });

            // Supprimer le membre de la blacklist
            await client.db.promise().query('DELETE FROM blacklist WHERE user_id = ?', [member.id]);
            return message.reply({ content: `${member.username} n'est plus blacklist`, allowedMentions: { repliedUser: false } });

        } else if (subcommand === "list") {
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