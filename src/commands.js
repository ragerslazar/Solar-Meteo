const {REST, Routes, SlashCommandBuilder} = require("discord.js");
require('dotenv').config({ path: require('find-config')('.env') })
const botID = "1190371850430201976"
const serverID = "";
const botToken = process.env.TOKEN;

const rest = new REST().setToken(botToken);
const registerCommands = async() => {
    try {
        //applicationGuildCommands(botId, serverID) = command specific to a server.
        await rest.put(Routes.applicationCommands(botID), {
            body: [
                new SlashCommandBuilder()
                .setName("weather")
                .setDescription("Returns the weather of the city.")
                .addStringOption(option => {
                    return option
                    .setName("city")
                    .setDescription("Choose a city.")
                    .setRequired(true)
                })
            ]
        })
        console.log("Command successfully created !")
    } catch (error) {
        console.error(error)
    }
};


registerCommands();