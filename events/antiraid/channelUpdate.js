const { EmbedBuilder } = require("discord.js");
const axios = require('axios');
const header = require("../../util/headers.js");
const logs = require("../../util/logs.js");

module.exports = async (client, oldChannel, newChannel) => {
    const guild = oldChannel.guild;
    const dbname = "channeledit";
    const name = "Modification de salon";
    const raison = `Antiraid | ${name}`;
    const head = header(client.token);
    const base = `https://discord.com/api/v10/guilds/${guild.id}`;

    const actionTypes = [11, 14, 13, 15]; // Channel Update, Permission Update, Permission Add, Permission Delete
    const actionNames = ["update", "perm_update", "perm_add", "perm_delete"];

    for (let i = 0; i < actionTypes.length; i++) {
        await handleAction(actionTypes[i], actionNames[i]);
    }

    async function handleAction(actionType, actionName) {
        try {
            const r = await axios.get(`${base}/audit-logs?limit=1&action_type=${actionType}`, { headers: head });
            if (!r || !r.data.audit_log_entries.length) return;

            const executor = await guild.members.fetch(r.data.audit_log_entries[0].user_id).catch(() => null);
            if (!executor) return;

            const [antiraidResult] = await client.db.promise().query('SELECT status, whitelist, sanction FROM antiraid WHERE guild_id = ? AND event = ?', [guild.id, dbname]);
            if (!antiraidResult.length || !antiraidResult[0].status) return;

            const [whitelistResult] = await client.db.promise().query('SELECT * FROM whitelist WHERE guild_id = ? AND user_id = ?', [guild.id, executor.id]);
            const [ownerResult] = await client.db.promise().query('SELECT * FROM bot_owners WHERE user_id = ?', [executor.id]);

            let perm = client.user.id === executor.id || guild.ownerId === executor.id || 
                       client.config.owner.includes(executor.id) || ownerResult.length > 0 || 
                       (!antiraidResult[0].whitelist && whitelistResult.length > 0);

            if (!perm) {
                let punish = antiraidResult[0].sanction || "kick";
                let user_punish = false;

                if (actionName === "update") {
                    await newChannel.edit({
                        name: oldChannel.name,
                        type: oldChannel.type,
                        topic: oldChannel.topic,
                        nsfw: oldChannel.nsfw,
                        bitrate: oldChannel.bitrate,
                        userLimit: oldChannel.userLimit,
                        rateLimitPerUser: oldChannel.rateLimitPerUser,
                        position: oldChannel.position,
                        permissionOverwrites: oldChannel.permissionOverwrites.cache,
                        reason: raison
                    });
                } else {
                    await newChannel.permissionOverwrites.set(oldChannel.permissionOverwrites.cache);
                }

                if (punish === "ban") {
                    user_punish = await executor.ban({ reason: raison }).then(() => true).catch(() => false);
                } else if (punish === "kick") {
                    user_punish = await executor.kick(raison).then(() => true).catch(() => false);
                } else if (punish === "derank") {
                    user_punish = await executor.roles.set([], raison).then(() => true).catch(() => false);
                }

                const logObj = {
                    client: client,
                    guild: guild,
                    executor: executor.id,
                    punish: user_punish ? `🟢 ${punish}` : `🔴 ${punish}`,
                    name: `${name} (${actionName})`,
                    salon: oldChannel.name
                };

                logs(logObj);
            }
        } catch (error) {
            console.error(`Erreur dans l'événement channelUpdate (${actionName}):`, error);
        }
    }
};