require('dotenv').config();
const { Client, Collection, GatewayIntentBits, REST, Routes } = require('discord.js');
const { readdirSync } = require('fs');
const mysql = require('mysql2');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.DirectMessages,
    ],
});

process.on("unhandledRejection", err => {
    console.error("Erreur non gérée :", err);
});

client.db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
	port: process.env.DB_PORT,
	waitForConnections: true,
	connectionLimit: 10,
	queueLimit: 0
});

client.db.connect(err => {
    if (err) {
        console.error('Erreur de connexion à la base de données :', err);
        return;
    }
    console.log('Connecté à la base de données MySQL');
});

client.commands = new Collection();
client.aliases = new Collection();
client.slashCommands = new Collection();

const loadCommands = (dir = "./cmd/") => {
    readdirSync(dir).forEach(dirs => {
        const commands = readdirSync(`${dir}/${dirs}/`).filter(files => files.endsWith(".js"));
        for (const file of commands) {
            const getFileName = require(`${dir}/${dirs}/${file}`);
            client.commands.set(getFileName.name, getFileName);
            console.log(`> Commande chargée ${getFileName.name} [${dirs}]`);
            if (getFileName.aliases && Array.isArray(getFileName.aliases)) {
                getFileName.aliases.forEach(alias => client.aliases.set(alias, getFileName.name));
            }
        }
    });
};


const loadSlashCommands = (dir = "./SlashCmd/") => {
    const commands = [];

    readdirSync(dir).forEach(dirs => {
        const commandFiles = readdirSync(`${dir}/${dirs}/`).filter(files => files.endsWith(".js"));

        for (const file of commandFiles) {
            const command = require(`${dir}/${dirs}/${file}`);
            if (command.data && command.execute) {
                client.slashCommands.set(command.data.name, command);
                commands.push(command.data.toJSON());
                console.log(`> Commande slash chargée ${command.data.name} [${dirs}]`);
            } else {
                console.log(`[AVERTISSEMENT] La commande ${file} est mal formée.`);
            }
        }
    });

    const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

    (async () => {
        try {
            console.log('Début du rafraîchissement des commandes slash (/).');

            await rest.put(
                Routes.applicationCommands(process.env.CLIENTID),
                { body: commands },
            );

            console.log('Commandes slash (/) rechargées avec succès.');
        } catch (error) {
            console.error(error);
        }
    })();
};


const loadEvents = (dir = "./events/") => {
    readdirSync(dir).forEach(dirs => {
        const events = readdirSync(`${dir}/${dirs}/`).filter(files => files.endsWith(".js"));
        for (const event of events) {
            const evt = require(`${dir}/${dirs}/${event}`);
            const evtName = event.split(".")[0];
            client.on(evtName, evt.bind(null, client));
            console.log(`> Événement chargé ${evtName}`);
        }
    });
};

loadEvents();
loadCommands();
loadSlashCommands();

client.login(process.env.BOT_TOKEN);
