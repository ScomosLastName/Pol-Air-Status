const {Client, Events, SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle} = require("discord.js");
const {token} = require("./config.json")

const client = new Client({intents: []});

const embed = new EmbedBuilder()
	.setColor(0x57F287)
	.setTitle('Default Embed')
	.setDescription('[Place Holder]')
	.setThumbnail('https://i.ibb.co/G3rbYFxN/image.png')
	.addFields({ name: 'Inline field title', value: 'Some value here', inline: true })
	.setTimestamp()

var airWingDeployed = false;
var embedMessageId;
var landTime;
var refuelTime;
var airWingAvaliable = true;
var flightTimer;
var refuelTimer;
var pilot;

async function updateEmbed() {
    if (airWingDeployed && airWingAvaliable) {
        embed
            .setColor(0xFEE75C)
            .setTitle('POL AIR IS DEPLOYED')
            .setDescription(`A <@${pilot}> already has Pol Air Deployed`)
            .setFields({ name: 'Pol Air must land:', value: `<t:${landTime}:R>`, inline: true })
            .setTimestamp()
    } else if (!airWingDeployed && airWingAvaliable) {
        embed
            .setColor(0x57F287)
            .setTitle('POL AIR IS NOT DEPLOYED')
            .setDescription('Pol Air is avaliable if their are adiquate units')
            .setFields({ name: 'Status:', value: 'Pol Air is currently not deployed', inline: true })
            .setTimestamp()
    } else if (!airWingAvaliable) {
        embed
            .setColor(0xED4245)
            .setTitle('POL AIR IS OUT OF FUEL')
            .setDescription('Pol Air is not avaliable until it is refueled, if deployed land immediately')
            .setFields({ name: 'Refueled in:', value: `<t:${refuelTime}:R>`, inline: true })
            .setTimestamp()
    }
}
// TODO correct the timing when out of testing
function setFlightTimer(endTime, interaction, row) {
    clearTimeout(refuelTimer);
    console.log('timer initiated');
    landTime = endTime;
    flightTimer = setTimeout(outOfFuel, /*endTime - (Math.floor(Date.now)/1000) * 1000 */ 20000, interaction, row);
}

function setRefuelTimer(endTime, interaction, row) {
    clearTimeout(flightTimer);
    console.log('timer initiated');
    refuel = endTime;
    refuelTimer = setTimeout(refueled, /*endTime - ((Math.floor(Date.now)/1000) * 1000*/20000, interaction, row)
}

async function refueled(interaction, row) {

    updateEmbed();  

    const channelid = interaction.channelId;
    if (!airWingAvaliable) {
        airWingAvaliable = true;
        updateEmbed();
        try {
            // Fetch the channel
            const channel = await interaction.client.channels.fetch(channelid);
        
            if (channel) {
                // Fetch the message
                const message = await channel.messages.fetch(embedMessageId);
                
                // If the message exists, delete it
                await message.delete();
                console.log('Message deleted successfully.');
            } else {
                console.error('Channel not found.');
            }
        } catch (error) {
            if (error.code === 10008) {
                console.error('The message does not exist or has been deleted.');
            } else {
                console.error('An error occurred while fetching or deleting the message:', error);
            }
        }
    
        const reply = await interaction.channel.send({ embeds: [embed], fetchReply: true, components: [row] });
        embedMessageId = reply.id;
    }
    airWingAvaliable = true;
}

async function outOfFuel (interaction, row) {
    airWingAvaliable = false;
    airWingDeployed = false;
    refuelTime = Math.floor(Date.now()/1000) + 1800

    updateEmbed();  

    const channelid = interaction.channelId;

    try {
        // Fetch the channel
        const channel = await interaction.client.channels.fetch(channelid);
    
        if (channel) {
            // Fetch the message
            const message = await channel.messages.fetch(embedMessageId);
            
            // If the message exists, delete it
            await message.delete();
            console.log('Message deleted successfully.');
        } else {
            console.error('Channel not found.');
        }
    } catch (error) {
        if (error.code === 10008) {
            console.error('The message does not exist or has been deleted.');
        } else {
            console.error('An error occurred while fetching or deleting the message:', error);
        }
    }

    const reply = await interaction.channel.send({ embeds: [embed], fetchReply: true });
    embedMessageId = reply.id;

    setRefuelTimer(refuelTime, interaction, row)
}

client.once(Events.ClientReady, c => {
    console.log(`Logged in as ${c.user.username}`);
    console.log(`At ${Date.now()}`);

    const init_embed = new SlashCommandBuilder()
        .setName("init_embed")
        .setDescription("Example Embed")
        

    const toggle_pol_air = new SlashCommandBuilder()
        .setName("toggle_pol_air")
        .setDescription("Deploys / Undeploys Pol Air")

    client.application.commands.create(init_embed);
    client.application.commands.create(toggle_pol_air);
    
    updateEmbed();
});

client.on(Events.InteractionCreate, async (interaction) => {

    const deploy = new ButtonBuilder()
        .setCustomId('deploy')
        .setLabel('Deploy / Undeploy')
        .setStyle(ButtonStyle.Success)

    const row = new ActionRowBuilder()
    .addComponents(deploy)

    if (interaction.commandName === "init_embed") {
        const reply = await interaction.reply({ embeds: [embed], fetchReply: true, components: [row] });
        embedMessageId = reply.id;

        console.log(embedMessageId)
    } else if (interaction.commandName === "toggle_pol_air" || interaction.isButton(deploy)) {
        airWingDeployed = !airWingDeployed;
        if (airWingDeployed) {
            setFlightTimer(Math.floor(Date.now()/1000) + 5400, interaction, row);
            pilot = interaction.user.id;
        } else {
            setRefuelTimer(Math.floor(Date.now()/1000) + 1800, interaction, row);
            pilot = null;
        }

        updateEmbed();  

        const channelid = interaction.channelId;

        try {
            // Fetch the channel
            const channel = await interaction.client.channels.fetch(channelid);
        
            if (channel) {
                // Fetch the message
                const message = await channel.messages.fetch(embedMessageId);
                
                // If the message exists, delete it
                await message.delete();
                console.log('Message deleted successfully.');
            } else {
                console.error('Channel not found.');
            }
        } catch (error) {
            if (error.code === 10008) {
                console.error('The message does not exist or has been deleted.');
            } else {
                console.error('An error occurred while fetching or deleting the message:', error);
            }
        }

        const reply = await interaction.reply({ embeds: [embed], fetchReply: true, components: [row]});
        embedMessageId = reply.id;
    }
})

client.login(token);    