const cooldowns = new Map();

module.exports = async (client, message) => {
    if (message.author.bot) return;
    if (message.channel.type === 1) return;     

    const [guildSettings] = await client.db.promise().query('SELECT prefix, color FROM guild_settings WHERE guild_id = ?', [message.guild.id]);
    const prefix = guildSettings[0]?.prefix || process.env.DEFAULT_PREFIX;
    const color = guildSettings[0]?.color || process.env.DEFAULT_COLOR;

    if (message.content.match(new RegExp(`^<@!?${client.user.id}>( |)$`)) !== null) {
        const [ownerStatus] = await client.db.promise().query('SELECT is_owner FROM bot_owners WHERE user_id = ?', [message.author.id]);
        if (process.env.OWNER_IDS.split(',').includes(message.author.id) || ownerStatus[0]?.is_owner) {
            return message.reply({ content: `Mon préfixe : \`${prefix}\``, allowedMentions: { repliedUser: false } });
        }
    }

    const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(prefix)})\\s*`);
    if (!prefixRegex.test(message.content)) return;

    const [, matchedPrefix] = message.content.match(prefixRegex);
    const args = message.content.slice(matchedPrefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
    if (command) {
        if (!cooldowns.has(command.name)) {
            cooldowns.set(command.name, new Map());
        }

        const now = Date.now();
        const timestamps = cooldowns.get(command.name);
        const cooldownAmount = (command.cooldowns || 3) * 1000;

        if (timestamps.has(message.author.id)) {
            const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

            if (now < expirationTime) {
                const timeLeft = (expirationTime - now) / 1000;
                return message.reply(`Veuillez attendre ${timeLeft.toFixed(1)} seconde(s) avant de réutiliser la commande \`${command.name}\`.`);
            }
        }

        timestamps.set(message.author.id, now);
        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

        try {
            await command.execute(client, message, args, prefix, color);
        } catch (error) {
            console.error(error);
            message.reply('Une erreur s\'est produite lors de l\'exécution de la commande.').catch(console.error);
        }
    }
};
