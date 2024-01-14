const {REST, Routes} = require("discord.js");
require('dotenv').config({ path: require('find-config')('.env') })
const botID = "1190371850430201976"
const serverID = "";
const botToken = process.env.TOKEN;

const rest = new REST().setToken(botToken);
const deleteCommands = async() => {
    rest.delete(Routes.applicationGuildCommand(botID, serverID, '')) 
	.then(() => console.log('Successfully deleted application command'))
	.catch(console.error);
}
deleteCommands();