const { EmbedBuilder } = require("discord.js");
const logs = require("../../util/logs.js");

module.exports = async (client, oldMessage, newMessage) => {
    if (!newMessage.guild) return;

    const discord = RegExp(/(https?:\/\/)?(www\.)?(discord\.(gg|io|me|)|discordapp\/invite)\/.+[^\s]/);
    if (discord.test(newMessage.content)) {
        try {
            const guild = newMessage.guild;
            const dbname = "pub";
            const name = "Message contenant une invitation discord";
            const raison = `Antiraid | ${name}`;
            const executor = newMessage.member;

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

                await newMessage.delete().catch(() => {});

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
                    name: name,
                };

                logs(logObj);
            }
        } catch (error) {
            console.error("Erreur dans l'événement messageUpdate:", error);
        }
    }
};