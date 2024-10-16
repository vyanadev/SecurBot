const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'lock',
    description: "Verrouiller ou déverrouiller un canal",
    usage: "[on/off]",
    aliases: ["verrouiller"],
    cooldowns: 5,
    execute: async (client, message, args, prefix, color) => {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels) &&
            !message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply("Vous n'avez pas la permission de gérer les canaux.");
        }

        if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return message.reply("Je n'ai pas la permission de gérer les canaux.");
        }

        const state = args[0]?.toLowerCase();
        const lock = state !== 'off';

        try {
            await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
                SendMessages: !lock
            });

            const embed = new EmbedBuilder()
                .setTitle(lock ? 'Canal verrouillé' : 'Canal déverrouillé')
                .setDescription(`Le canal a été ${lock ? 'verrouillé' : 'déverrouillé'} avec succès.`)
                .setColor(color)
                .setTimestamp();

            await message.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await message.reply("Une erreur s'est produite lors du verrouillage/déverrouillage du canal.");
        }
    }
};