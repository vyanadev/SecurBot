const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require("discord.js");

module.exports = async (client, member) => {
    try {
        // Récupérer les paramètres de vérification pour la guilde
        const [settings] = await client.db.promise().query('SELECT * FROM verify_settings WHERE guild_id = ?', [member.guild.id]);
        if (settings.length === 0 || !settings[0].verify_status) return;

        const verifyChannelId = settings[0].verify_channel;
        const verifyRoleId = settings[0].verify_role;
        const verifyMessage = settings[0].verify_message || "Veuillez vérifier votre compte en cliquant sur le bouton ci-dessous.";
        const verifyType = settings[0].verify_type || "button";

        const verifyChannel = member.guild.channels.cache.get(verifyChannelId);
        if (!verifyChannel) return;

        // Créer un message de vérification selon le type
        if (verifyType === "button") {
            await handleButtonVerification(verifyChannel, member, verifyMessage, verifyRoleId);
        } else if (verifyType === "captcha") {
            await handleCaptchaVerification(verifyChannel, member, verifyMessage, verifyRoleId);
        } else if (verifyType === "reaction") {
            await handleReactionVerification(verifyChannel, member, verifyMessage, verifyRoleId);
        }
    } catch (error) {
        console.error("Erreur dans l'événement guildMemberAdd:", error);
    }
};

async function handleButtonVerification(channel, member, messageContent, roleId) {
    const button = new ButtonBuilder()
        .setCustomId(`verify_${member.id}`)
        .setLabel("Vérifier")
        .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(button);

    const message = await channel.send({
        content: `${member}, ${messageContent}`,
        components: [row]
    });

    const collector = message.createMessageComponentCollector({ time: 60000 * 5 });

    collector.on('collect', async interaction => {
        if (interaction.customId === `verify_${member.id}`) {
            await interaction.deferUpdate();
            const role = member.guild.roles.cache.get(roleId);
            if (role) {
                await member.roles.add(role);
                await interaction.followUp({ content: "Vous avez été vérifié avec succès!", ephemeral: true });
            }
            collector.stop();
        }
    });

    collector.on('end', async () => {
        await message.delete().catch(console.error);
    });
}

async function handleCaptchaVerification(channel, member, messageContent, roleId) {
    const captcha = generateCaptcha(); // Fonction fictive pour générer un captcha
    const embed = new EmbedBuilder()
        .setTitle("Vérification Captcha")
        .setDescription(`${member}, veuillez résoudre ce captcha : \`${captcha}\``)
        .setColor("BLUE");

    const message = await channel.send({ embeds: [embed] });

    const filter = response => response.author.id === member.id && response.content === captcha;
    const collector = channel.createMessageCollector({ filter, time: 60000 });

    collector.on('collect', async () => {
        const role = member.guild.roles.cache.get(roleId);
        if (role) {
            await member.roles.add(role);
            await channel.send(`${member}, vous avez été vérifié avec succès!`);
        }
        collector.stop();
    });

    collector.on('end', collected => {
        if (collected.size === 0) {
            channel.send(`${member}, vous n'avez pas réussi à résoudre le captcha à temps.`);
        }
    });
}

async function handleReactionVerification(channel, member, messageContent, roleId) {
    const embed = new EmbedBuilder()
        .setTitle("Vérification par Réaction")
        .setDescription(`${member}, réagissez avec 👍 pour vérifier votre compte.`)
        .setColor("GREEN");

    const message = await channel.send({ embeds: [embed] });

    await message.react('👍');

    const filter = (reaction, user) => reaction.emoji.name === '👍' && user.id === member.id;
    const collector = message.createReactionCollector({ filter, time: 60000 });

    collector.on('collect', async () => {
        const role = member.guild.roles.cache.get(roleId);
        if (role) {
            await member.roles.add(role);
            await channel.send(`${member}, vous avez été vérifié avec succès!`);
        }
        collector.stop();
    });

    collector.on('end', collected => {
        if (collected.size === 0) {
            channel.send(`${member}, vous n'avez pas réagi à temps.`);
        }
    });
}
function generateCaptcha(length = 6) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let captcha = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        captcha += characters[randomIndex];
    }
    return captcha;
}