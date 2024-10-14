const { EmbedBuilder } = require("discord.js");
const logs = require("../../util/logs.js");

module.exports = async (client, message) => {
    if (!message.guild) return;

    const guild = message.guild;
    const executor = message.author;

    try {
        await ping();
        await pub();
        await spam();
    } catch (error) {
        console.error("Erreur dans l'événement messageCreate:", error);
    }

    async function ping() {
        const dbname = "ping";
        const name = "Multiplication de ping";
        const raison = `Antiraid | ${name}`;
        const pg = ["@everyone", "@here"];

        if (pg.some(word => message.content.includes(word))) {
            await client.db.promise().query('INSERT INTO message_ping_count (guild_id, user_id, count) VALUES (?, ?, 1) ON DUPLICATE KEY UPDATE count = count + 1', [guild.id, executor.id]);
            const [[{ count }]] = await client.db.promise().query('SELECT count FROM message_ping_count WHERE guild_id = ? AND user_id = ?', [guild.id, executor.id]);

            const [antiraidResult] = await client.db.promise().query('SELECT status, whitelist FROM antiraid WHERE guild_id = ? AND event = ?', [guild.id, dbname]);
            if (!antiraidResult.length || !antiraidResult[0].status) return;

            const [whitelistResult] = await client.db.promise().query('SELECT * FROM whitelist WHERE guild_id = ? AND user_id = ?', [guild.id, executor.id]);
            const [ownerResult] = await client.db.promise().query('SELECT * FROM bot_owners WHERE user_id = ?', [executor.id]);

            let perm = count <= 3 || client.user.id === executor.id || guild.ownerId === executor.id || 
                       client.config.owner.includes(executor.id) || ownerResult.length > 0 || 
                       (!antiraidResult[0].whitelist && whitelistResult.length > 0);

            if (!perm) {
                await client.db.promise().query('DELETE FROM message_ping_count WHERE guild_id = ? AND user_id = ?', [guild.id, executor.id]);
                await message.delete().catch(() => {});
                
                const member = await guild.members.fetch(executor.id).catch(() => null);
                if (member) {
                    await member.roles.set([]).catch(() => {});
                    await member.timeout(60000 * 5, raison).catch(() => {});
                }

                const logObj = {
                    client: client,
                    guild: guild,
                    executor: executor.id,
                    punish: `🟢 exclusion 5m`,
                    name: name,
                };
                logs(logObj);
            }
        }
    }

    async function spam() {
        const dbname = "spam";
        const name = "Multiplication de message";
        const raison = `Antiraid | ${name}`;

        await client.db.promise().query('INSERT INTO message_spam_count (guild_id, user_id, count, timestamp) VALUES (?, ?, 1, ?) ON DUPLICATE KEY UPDATE count = count + 1, timestamp = ?', [guild.id, executor.id, Date.now(), Date.now()]);
        const [[{ count }]] = await client.db.promise().query('SELECT count FROM message_spam_count WHERE guild_id = ? AND user_id = ? AND timestamp > ?', [guild.id, executor.id, Date.now() - 20000]);

        if (count >= 5) {
            const [antiraidResult] = await client.db.promise().query('SELECT status, whitelist FROM antiraid WHERE guild_id = ? AND event = ?', [guild.id, dbname]);
            if (!antiraidResult.length || !antiraidResult[0].status) return;

            const [whitelistResult] = await client.db.promise().query('SELECT * FROM whitelist WHERE guild_id = ? AND user_id = ?', [guild.id, executor.id]);
            const [ownerResult] = await client.db.promise().query('SELECT * FROM bot_owners WHERE user_id = ?', [executor.id]);

            let perm = client.user.id === executor.id || guild.ownerId === executor.id || 
                       client.config.owner.includes(executor.id) || ownerResult.length > 0 || 
                       (!antiraidResult[0].whitelist && whitelistResult.length > 0);

            if (!perm) {
                const spammsg = await message.channel.messages.fetch({ limit: 5 });
                spammsg.filter(msg => msg.author.id === executor.id).forEach(m => { m.delete().catch(() => {}); });

                const member = await guild.members.fetch(executor.id).catch(() => null);
                if (member) {
                    await member.roles.set([]).catch(() => {});
                    await member.timeout(60000 * 5, raison).catch(() => {});
                }

                const logObj = {
                    client: client,
                    guild: guild,
                    executor: executor.id,
                    punish: `🟢 exclusion 5m`,
                    name: name,
                };
                logs(logObj);
            }
        }
    }

    async function pub() {
        const discord = RegExp(/(https?:\/\/)?(www\.)?(discord\.(gg|io|me|)|discordapp\/invite)\/.+[^\s]/);
        if (discord.test(message.content)) {
            const dbname = "pub";
            const name = "Message contenant une invitation discord";
            const raison = `Antiraid | ${name}`;

            await client.db.promise().query('INSERT INTO pub_count (guild_id, user_id, count) VALUES (?, ?, 1) ON DUPLICATE KEY UPDATE count = count + 1', [guild.id, executor.id]);
            const [[{ count }]] = await client.db.promise().query('SELECT count FROM pub_count WHERE guild_id = ? AND user_id = ?', [guild.id, executor.id]);

            const [antiraidResult] = await client.db.promise().query('SELECT status, whitelist FROM antiraid WHERE guild_id = ? AND event = ?', [guild.id, dbname]);
            if (!antiraidResult.length || !antiraidResult[0].status) return;

            const [whitelistResult] = await client.db.promise().query('SELECT * FROM whitelist WHERE guild_id = ? AND user_id = ?', [guild.id, executor.id]);
            const [ownerResult] = await client.db.promise().query('SELECT * FROM bot_owners WHERE user_id = ?', [executor.id]);

            let perm = client.user.id === executor.id || guild.ownerId === executor.id || 
                       client.config.owner.includes(executor.id) || ownerResult.length > 0 || 
                       (!antiraidResult[0].whitelist && whitelistResult.length > 0);

            if (!perm) {
                await message.delete().catch(() => {});

                if (count >= 3) {
                    const member = await guild.members.fetch(executor.id).catch(() => null);
                    if (member) {
                        await member.roles.set([]).catch(() => {});
                        await member.timeout(60000 * 5, raison).catch(() => {});
                    }

                    const logObj = {
                        client: client,
                        guild: guild,
                        executor: executor.id,
                        punish: `🟢 exclusion 5m`,
                        name: name,
                    };
                    logs(logObj);
                }
            }
        }
    }
};