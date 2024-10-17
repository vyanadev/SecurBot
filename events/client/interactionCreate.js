const { InteractionType, Collection } = require('discord.js');

// Collection pour stocker les cooldowns
const cooldowns = new Collection();

module.exports = async (client, interaction) => {
    if (!interaction.isCommand() && !interaction.isButton()) return;

    const [guildSettings] = await client.db.promise().query('SELECT prefix, color FROM guild_settings WHERE guild_id = ?', [interaction.guild.id]);
    const color = guildSettings[0]?.color || process.env.DEFAULT_COLOR;

    let commandName;
    let cooldownAmount;

    // Gestion des commandes slash
    if (interaction.type === InteractionType.ApplicationCommand) {
        const command = client.slashCommands.get(interaction.commandName);
        if (!command) return;

        commandName = command.data.name;
        cooldownAmount = (command.cooldown || 3) * 1000; // Cooldown en secondes, par défaut 3s

        // Vérification du cooldown
        if (await checkCooldown(interaction, commandName, cooldownAmount)) return;

        try {
            await command.execute(client, interaction, color);
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: 'Une erreur s\'est produite lors de l\'exécution de cette commande.',
                ephemeral: true
            });
        }
    }

async function checkCooldown(interaction, commandName, cooldownAmount) {
    if (!cooldowns.has(commandName)) {
        cooldowns.set(commandName, new Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(commandName);
    const cooldownTime = cooldownAmount;

    if (timestamps.has(interaction.user.id)) {
        const expirationTime = timestamps.get(interaction.user.id) + cooldownTime;

        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            await interaction.reply({
                content: `Veuillez attendre ${timeLeft.toFixed(1)} seconde(s) avant de réutiliser la commande \`${commandName}\`.`,
                ephemeral: true
            });
            return true;
        }
    }

    timestamps.set(interaction.user.id, now);
    setTimeout(() => timestamps.delete(interaction.user.id), cooldownTime);
    return false;
    }
}
