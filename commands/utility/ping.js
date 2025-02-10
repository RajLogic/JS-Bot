const { SlashCommandBuilder } = require('@discordjs/builders');
const { CommandInteraction, Message } = require('discord.js');
const { time } = require('node:console');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Returns bot latency.'),
    name: 'ping',
    description: 'Returns bot latency.',
    async execute(message) {
        console.log("Ping command invoked.");

        // Capture the start time
        const startTime = Date.now();

        // Send an initial message
        const sentMessage = await message.reply("Pinging...");

        // Calculate latency
        const endTime = Date.now();
        const latency = endTime - startTime;

        // Edit the message to display the latency
        await sentMessage.edit(`:ping_pong: Pong! Latency: \`${latency}ms\``);
    },
    async executeSlash(interaction) {
        console.log("Slash command invoked.");

        // Capture the start time
        const startTime = Date.now();

        // Send an initial message
        await interaction.reply("Pinging...");

        // Calculate latency
        const endTime = Date.now();
        const latency = endTime - startTime;

        // Edit the message to display the latency
        await interaction.editReply(`:ping_pong: Pong! Latency: \`${latency}ms\``);
    }
};