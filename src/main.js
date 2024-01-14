require('dotenv').config({ path: require('find-config')('.env') })
const {Client, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ActivityType, IntentsBitField, DiscordjsError} = require("discord.js");
var XMLHttpRequest = require('xhr2');
const client = new Client({
    intents: [IntentsBitField.Flags.Guilds]
})

client.on("ready", async()=> {
    console.log("The bot is online ✅ !")
    client.user.setActivity({
        name: "/weather",
        type: ActivityType.Playing,
    })
});

client.on("interactionCreate", async (interaction) => {
    if(interaction.isCommand()) {
        if(interaction.commandName === "weather") {
            const data = interaction.options.getString("city");

            const embedError = new EmbedBuilder()
            .setColor(0xCB0D0D)
            .setAuthor({ name: 'Solar Meteo', iconURL: "https://play-lh.googleusercontent.com/Nwn4J-GZ0UTSZW1zypE-0ABFVGxfjNWkqrvSpNoWhNRh2y_EIx-KukwW5GgtB5sF3g=w240-h480-rw"})

            const xhr = new XMLHttpRequest();
            xhr.open("GET", `https://api.weatherapi.com/v1/current.json?key=${process.env.API_TOKEN}&q=${data}&aqi=yes`);
            xhr.send();
            xhr.onload = async() => {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    var parsed_data = JSON.parse(xhr.response);
                    console.log(parsed_data)

                    var getLocalDateTime = parsed_data.location.localtime;
                    var splitLocalDateTime = getLocalDateTime.split(" ");

                    //var unixToDate = new Date(getLocalDateTime * 1000);
                    //var euDate = unixToDate.toLocaleTimeString("fr-FR");
                    
                    var us_epa_index = parsed_data.current.air_quality["us-epa-index"];
                    if (us_epa_index == 1) {
                        us_epa_index = "Good"
                    } else if (us_epa_index == 2) {
                        us_epa_index = "Moderate"
                    } else if (us_epa_index == 3) {
                        us_epa_index = "Unhealthy for sensitive people"
                    } else if (us_epa_index == 4) {
                        us_epa_index = "Unhealty"
                    } else if (us_epa_index == 5) {
                        us_epa_index = "Very unhealthy"
                    } else if (us_epa_index == 6) {
                        us_epa_index = "Hasardous"
                    }
                    
                    const forecast_button = new ButtonBuilder()
                        .setCustomId('forecast_click')
                        .setLabel('🕒 Forecast')
                        .setStyle(ButtonStyle.Success);

                    const row = new ActionRowBuilder()
                        .addComponents(forecast_button);

                    const embedWeather = new EmbedBuilder()
                    .setColor(0xFAEB09)
                    .setTitle(`${parsed_data.location.name} | ${splitLocalDateTime[1]}`)
                    .setURL(`https://www.google.com/maps/place/${parsed_data.location.name}`)
                    .setAuthor({ name: 'Solar Meteo', iconURL: "https://i.ibb.co/859F3zX/meteo.png"}) //Freep!k
                    .setThumbnail(`https:${parsed_data.current.condition.icon}`)
                    .addFields(
                        { name: 'Temperature 🌡️', value: `${parsed_data.current.temp_c}°C | ${parsed_data.current.temp_f}°F` },
                        { name: 'Condition 🌤️', value: parsed_data.current.condition.text },
                        { name : 'Air quality 🌫️', value : us_epa_index }                       
                    )
                    .setFooter({ text: `Weather for ${parsed_data.location.name}, ${parsed_data.location.country}`});

                    await interaction.deferReply();
                    const response_button = await interaction.editReply({
                        embeds: [embedWeather],
                        components: [row] //Ajout des boutons au message
                        //content: "City: " + parsed_data.location.name + "\nTemparature: " + parsed_data.current.temp_c + "°C" --> simple way
                    })

                    const collectorFilter = (i) => i.user.id === interaction.user.id; //If the user's id who interacted with button is the same as the user's id who typed the command then it's the same person, so we let the interaction happen
                    try {
                        const confirmation = await response_button.awaitMessageComponent({
                            filter: collectorFilter, //We apply the filter
                            componenType: "BUTTON",
                            time: 1800000, //time the user has to reply before expiring (30 minutes)
                        });

                        if (confirmation.customId === "forecast_click") {
                            const xhr_forecast = new XMLHttpRequest();
                            xhr_forecast.open("GET", `https://api.weatherapi.com/v1/forecast.json?key=${process.env.API_TOKEN}&q=${data}&aqi=yes&&days=1&alerts=no`);
                            xhr_forecast.send();
                            xhr_forecast.onload = async() => {
                                if (xhr_forecast.readyState == 4 && xhr_forecast.status == 200) {
                                    var parsed_data_forecast = JSON.parse(xhr_forecast.response)

                                    const embedWeather_Forecast = new EmbedBuilder()
                                    .setColor(0xFAEB09)
                                    .setTitle(`${parsed_data.location.name} | ${splitLocalDateTime[0]}`)
                                    .setURL(`https://www.google.com/maps/place/${parsed_data_forecast.location.name}`)
                                    .setThumbnail(`https:${parsed_data_forecast.current.condition.icon}`)
                                    .setAuthor({ name: 'Solar Meteo', iconURL: "https://i.ibb.co/859F3zX/meteo.png"})
                                    .setFooter({ text: `Weather for ${parsed_data_forecast.location.name}, ${parsed_data_forecast.location.country}`})

                                    for (i =0; i <= 23; i++) {
                                        var getForecastHour = parsed_data_forecast.forecast.forecastday[0].hour[i].time;
                                        var splitForecastHour = getForecastHour.split(" ");
                                        
                                        embedWeather_Forecast.addFields(
                                            { name: `${splitForecastHour[1]} 🕑`, value: `${parsed_data_forecast.forecast.forecastday[0].hour[i].temp_c}°C | ${parsed_data_forecast.forecast.forecastday[0].hour[i].temp_f}°F \n ${parsed_data_forecast.forecast.forecastday[0].hour[i].condition.text}`, inline: true },
                                        )
                                        console.log(splitForecastHour[1]);
                                    }
                                    await interaction.editReply({
                                        embeds: [embedWeather_Forecast]
                                    });
                                
                                } else {
                                    data_error_forecast = JSON.parse(xhr_forecast.response);
                                    embedError.addFields(
                                        {name: "Error !", value: `Status code: ${xhr_forecast.status}, Code: ${data_error_forecast.error.code}`}
                                    )
                                    await interaction.editReply({
                                        embeds: [embedError],
                                        ephemeral: true
                                    })
                                }
                            }
                        }   
                    } catch (e) {
                        if (e instanceof DiscordjsError) {
                            embedError.addFields(
                                {name: "Error !", value: `Time for interaction has been exceeded.`}
                            )
                            interaction.followUp({ //await?
                                embeds: [embedError],
                                ephemeral: true
                            })
                        }
                    }

                } else {
                    data_error = JSON.parse(xhr.response);
                    embedError.addFields(
                        {name: "Error !", value: `Status code: ${xhr.status}, Code: ${data_error.error.code}`}
                    )
                    await interaction.reply({
                        embeds: [embedError],
                        ephemeral: true
                    })
                }
            }
        }
    }
});

client.login(process.env.TOKEN);