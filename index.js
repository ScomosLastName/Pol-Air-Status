const dotenv = require('dotenv');
dotenv.config();
const {
    Client, 
    Events, 
    SlashCommandBuilder, 
    EmbedBuilder, ButtonBuilder, 
    ActionRowBuilder, ButtonStyle, 
    REST, Routes //Final 2 are used when clearing commands
} = require("discord.js");

//CLEARS OLD COMMANDS

/*
const commands = []; // an empty array will clear all global commands

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('Removing all global commands...');

    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands },
    );

    console.log('Successfully removed all global commands.');
  } catch (error) {
    console.error(error);
  }
})();
*/

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
var logChannelId;

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
function setFlightTimer(time, interaction, row) {
    clearTimeout(refuelTimer);
    console.log(`Flight timer initiated ${time}`);
    landTime = time/1000 + Math.floor(Date.now()/1000);
    flightTimer = setTimeout(outOfFuel, time, interaction, row);
}

function setRefuelTimer(time, interaction, row) {
    clearTimeout(flightTimer);
    console.log(`refuel timer initiated ${time}`);
    refuelTime = time/1000 + Math.floor(Date.now()/1000);
    refuelTimer = setTimeout(refueled, time, interaction, row)
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
    
        const reply = await interaction.channel.send({ 
            embeds: [embed], 
            fetchReply: true, 
            components: [row] 
        });

        embedMessageId = reply.id;
    }
    airWingAvaliable = true;
}

async function outOfFuel (interaction, row) {
    airWingAvaliable = false;
    airWingDeployed = false;

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

    setRefuelTimer(1800000/*20000*/, interaction, row)
    updateEmbed();
    const reply = await interaction.channel.send({ 
        embeds: [embed], 
        fetchReply: true
    });
    embedMessageId = reply.id;
}

function createLogEmbed(pilot, status, i) {
    const logEmbed = new EmbedBuilder()
    if (status) {
        logEmbed
            .setColor(0x5865F2)
            .setTitle('Flight log')
            .setDescription('Pol Air has been deployed!')
            .setThumbnail('https://i.ibb.co/G3rbYFxN/image.png')
            .addFields({ name: 'Deployed By:', value: `<@${i.user.id}>`, inline: true })
            .setTimestamp()
    } else {
        logEmbed
            .setColor(0x5865F2)
            .setTitle('Flight log')
            .setDescription('Pol Air has been undeployed!')
            .setThumbnail('https://i.ibb.co/G3rbYFxN/image.png')
            .addFields({ name: 'Undeployed By:', value: `<@${i.user.id}>`, inline: true })
            .setTimestamp()
    }
    return logEmbed;
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

    const set_log_channel = new SlashCommandBuilder()
        .setName('set_log_channel')
        .setDescription('Sets the channel for deployment logs')

    client.application.commands.create(init_embed);
    client.application.commands.create(toggle_pol_air);
    client.application.commands.create(set_log_channel);
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
        const reply = await interaction.reply({
            embeds: [embed],
            fetchReply: true, 
            components: [row] 
        });

        embedMessageId = reply.id;

        console.log(embedMessageId)
    } else if (interaction.commandName === "toggle_pol_air" || interaction.isButton(deploy)) {
        airWingDeployed = !airWingDeployed;

        if (logChannelId) {
            const logChannel = await interaction.client.channels.fetch(logChannelId);
            await logChannel.send({
                embeds: [createLogEmbed(interaction.user.id, airWingDeployed, interaction)]
            });
        }
        
        if (airWingDeployed) {
            setFlightTimer(5400000/*20000*/, interaction, row);
            pilot = interaction.user.id;
        } else {
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

        const reply = await interaction.reply({ 
            embeds: [embed], 
            fetchReply: true, 
            components: [row]
        });
        embedMessageId = reply.id;
    } else if (interaction.commandName === "set_log_channel") {
        logChannelId = interaction.channelId;
        interaction.reply({
            content: `Set to <#${logChannelId}>`,
            ephemeral: true
        });    }
});

client.login(process.env.DISCORD_TOKEN);    