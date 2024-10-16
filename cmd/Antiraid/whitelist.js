const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'whitelist',
    description: "Permet de whitelist un utilisateur du serveur.",
    usage: `[add/clear/remove/list]`,
    aliases: ["wl"],
    cooldowns: 10,
    execute: async (client, message, args, prefix, color) => {
        try {
            // Vérifier si l'utilisateur est un propriétaire du bot
            const [ownerResult] = await client.db.promise().query('SELECT COUNT(*) AS count FROM bot_owners WHERE user_id = ?', [message.author.id]);
            if (ownerResult[0].count === 0) return;

            const subcommand = args[0];
            const userId = args[1];

            if (subcommand === "add") {
                // Récupérer le membre à ajouter
                const member = userId ? await client.users.fetch(userId).catch(() => null) : message.mentions.users.first();
                if (!member) return message.reply({ content: `Aucun membre trouvé pour \`${userId || "❌"}\``, allowedMentions: { repliedUser: false } });

                // Vérifier si le membre est déjà whitelist
                const [whitelisted] = await client.db.promise().query('SELECT COUNT(*) AS count FROM whitelist WHERE guild_id = ? AND user_id = ?', [message.guild.id, member.id]);
                if (whitelisted[0].count > 0) return message.reply({ content: `${member.username} est déjà whitelist`, allowedMentions: { repliedUser: false } });

                // Ajouter le membre à la whitelist
                await client.db.promise().query('INSERT INTO whitelist (guild_id, user_id) VALUES (?, ?)', [message.guild.id, member.id]);
                return message.reply({ content: `${member.username} est maintenant whitelist`, allowedMentions: { repliedUser: false } });

            } else if (subcommand === "clear") {
                // Supprimer tous les membres de la whitelist
                const [result] = await client.db.promise().query('DELETE FROM whitelist WHERE guild_id = ?', [message.guild.id]);
                const count = result.affectedRows;
                return message.reply({ content: `${count} ${count > 1 ? "personnes ont été supprimées" : "personne a été supprimée"} de la whitelist`, allowedMentions: { repliedUser: false } });

            } else if (subcommand === "remove") {
                // Récupérer le membre à supprimer 
                const member = userId ? await client.users.fetch(userId).catch(() => null) : message.mentions.users.first();
                if (!member) return message.reply({ content: `Aucun membre trouvé pour \`${userId || "❌"}\``, allowedMentions: { repliedUser: false } });

                // Vérifier si le membre est whitelist
                const [whitelisted] = await client.db.promise().query('SELECT COUNT(*) AS count FROM whitelist WHERE guild_id = ? AND user_id = ?', [message.guild.id, member.id]);
                if (whitelisted[0].count === 0) return message.reply({ content: `${member.username} n'est pas whitelist`, allowedMentions: { repliedUser: false } });

                // Supprimer le membre de la whitelist  
                await client.db.promise().query('DELETE FROM whitelist WHERE guild_id = ? AND user_id = ?', [message.guild.id, member.id]);
                return message.reply({ content: `${member.username} n'est plus whitelist`, allowedMentions: { repliedUser: false } });

            } else if (subcommand === "list") {
                // Récupérer la liste des membres whitelistés
                const [whitelisted] = await client.db.promise().query('SELECT user_id FROM whitelist WHERE guild_id = ?', [message.guild.id]);
                
                // Pagination
                const count = 15;
                let page = 1;
                const generateEmbed = (start) => {
                    const current = whitelisted.slice(start, start + count);
                    return new EmbedBuilder()
                        .setTitle(`Whitelist`)
                        .setFooter({ text: `${page} / ${Math.ceil(whitelisted.length / count) || 1}` })
                        .setColor(color)
                        .setDescription(current.map(user => `<@${user.user_id}>`).join('\n') || "Aucune donnée trouvée");
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