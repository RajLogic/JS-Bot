const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, MessageFlags, GatewayIntentBits, Partials, ActivityType } = require('discord.js');
const { config } = require('dotenv');


config({ path: path.resolve(__dirname, './data/.env') });

const token = process.env.token;
const prefix = process.env.prefix;
const link = process.env.link;
const ownerid = process.env.ownerid ? parseInt(process.env.ownerid) : null;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

client.on('messageCreate', async message => {
    if (message.content === `${prefix}sync` && message.author.id === ownerid) {
        const commands = await client.application.commands.set([]);
        console.log(`Synced ${commands.size} command(s).`);
        await message.reply(`Synced ${commands.size} command(s).`);
    }
});

client.on('messageCreate', async message => {
    if (message.content.startsWith(`${prefix}setactivity`) && message.author.id === ownerid) {
        const activity1 = message.content.slice(prefix.length + 12).trim();
        await message.delete();
        await message.channel.send(`Game was set to **${activity1}**!`);
        await client.user.setActivity(activity1, { type: ActivityType.Listening });
    } else if (message.content.startsWith(`${prefix}setactivity`)) {
        await message.reply("You don't have permission to set the activity.");
    }
});

client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
            console.log(`Loaded command: ${command.data.name}`);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

// Check if the token is set
if (!token) {
    throw new Error("DISCORD_TOKEN is not set in the .env file");
}

// Check if the prefix is set
if (!prefix) {
    throw new Error("DISCORD_PREFIX is not set in the .env file");
}

// Check if the owner ID is set
if (!ownerid) {
    throw new Error("DISCORD_OWNERID is not set in the .env file");
}

// Check if the link is set
if (!link) {
    throw new Error("DISCORD_LINK is not set in the .env file");
}

client.once(Events.ClientReady, readyClient => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);

});

client.once('ready', async () => {
    await client.application.commands.set([]);
    console.log("----------------------");
    console.log("Logged In As");
    console.log(`Username: ${client.user.username}`);
    console.log(`ID: ${client.user.id}`);
    console.log("----------------------");
    console.log(prefix);
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;
    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
        } else {
            await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
        }
    }
});

client.login(token);