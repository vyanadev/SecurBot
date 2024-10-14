module.exports = async (client, message) => {
    if (message.author.bot) return;
    if (message.channel.type === 1) return;     

    // Récupérer le préfixe et la couleur depuis la base de données
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
        try {
            await command.execute(client, message, args, prefix, color);
        } catch (error) {
            console.error(error);
            message.reply('Une erreur s\'est produite lors de l\'exécution de la commande.').catch(console.error);
        }
    }
};