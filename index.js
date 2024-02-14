const { Client, Intents, MessageReaction } = require("discord.js")
const allIntents = new Intents(32767);
const client = new Client({ intents: allIntents });
const g = require("./giveaway.json");
const { Collection } = require('discord.js');
const { createWriteStream } = require("fs");
const db = require('quick.db')
const Invites = new Collection();
const moment = require('moment');
const fs = require('fs');
const usersMap = new Map();
//const djs = require('djs-fun-v12')
const prefix = '!';
const { MessageEmbed } = require('discord.js');
const { MessageActionRow, MessageSelectMenu, MessageButton } = require("discord.js")
const ms = require('ms')
const Discord = require('discord.js')
const axios = require('axios')
const { channel } = require('diagnostics_channel');
const { set, defaultConfiguration } = require('express/lib/application');
const voiceCollection = new Collection();
const { AuditLogEvent } = require('discord.js');
const config = require('./config.json');
//let hastebin = require('hastebin');
const guildInvites = new Map()
const { syncBuiltinESMExports } = require("module");
const osu = require('node-os-utils');
var os = require('os');
const ms2 = require("parse-ms");
const { ActionRowBuilder, Modal, TextInputBuilder, TextInputStyle, TextInputComponent } = require('discord.js');
const { response } = require("express");
client.commands = new Collection();
client.login(config.token)
////// Start Up \\\\\\
client.once('ready', () => {
  console.log(`${client.user.tag} is online`);
  //client.user.setActivity(config.game, { type: config.type });
  client.user.setPresence(
    {
      activities: [
        {
          name: config.game,
          type: config.type
        }
      ],
      status: "dnd" // online, idle, invisible, dnd
    }
  )
});
//Errors
client.on('shardError', error => {
  console.error('A websocket connection encountered an error:', error);
})

process.on('unhandledRejection', error => {
  console.error(error);
});
client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);

  client.commands.set(command.name, command);
}

client.on('messageCreate', message => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'say') {
    client.commands.get('say').execute(message, args);
  }
  if (command === 'say2') {
    client.commands.get('say2').execute(message, args);
  }
  if (command === 'ban') {
    client.commands.get('ban').execute(message, args);
  }
  if (command === 'kick') {
    client.commands.get('kick').execute(message, args);
  }
});


//clear command
client.on('messageCreate', async (message) => {
  if (message.author.bot) return
  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  if (message.content.startsWith('!clear')) {
    if (!message.member.permissions.has("ADMINISTRATOR")) return message.reply("**You do not have permissions.**")
    const content = args.join(' ');
    if (!content) return message.channel.send("How many messages do you want to delete ?")
    message.channel.bulkDelete(content).catch(e => { message.channel.send('Δεν μπορείς να σβήσεις τόσο παλιά μηνύματα .') })

  }
})
client.on("messageCreate", async message => {

  if (message.content === '!lock') {
    if (message.member.permissions.has("ADMINISTRATOR")) {
      message.channel.send({ content: "Channel Locked" })
      message.channel.permissionOverwrites.set([
        {
          id: message.guild.id,
          deny: ['SEND_MESSAGES']
        },
      ])

    }
  }
})
client.on("messageCreate", async message => {


  if (message.content === '!unlock') {
    if (message.member.permissions.has("ADMINISTRATOR")) {
      message.channel.send({ content: "Channel unlocked" })
      message.channel.permissionOverwrites.set([
        {
          id: message.guild.id,
          allow: ['SEND_MESSAGES']
        },
      ])
    }
  }
})







//Giveaway
client.on('messageCreate', async (message) => {
  let args = message.content.substring(prefix.length).split(" ")
  if ((message.content.startsWith(`!gstart`))) {
    if (!message.member.permissions.has("ADMINISTRATOR")) return message.channel.send({ content: "**Χρειάζεται να έχεις Administrator**" })
    let duration = args[1];
    let winnerCount = args[2];
    if (!duration)
      return message.channel.send('**Give a valid duration** `d (ημέρες), h (ώρες), m (λεπτά), s (δευτερόλεπτα)`');
    if (
      !args[1].endsWith("d") &&
      !args[1].endsWith("h") &&
      !args[1].endsWith("m") &&
      !args[1].endsWith("s")
    )
      return message.channel.send("'**Give a valid duration** `d (ημέρες), h (ώρες), m (λεπτά), s (δευτερόλεπτα)`");
    if (!winnerCount) return message.channel.send('Please provide the number of winners for the giveaway! E.g. `1w`')
    if (isNaN(args[2].toString().slice(0, -1)) || !args[2].endsWith("w"))
      return message.channel.send('Pleave provide the ammount of winners! example `1w`');
    if ((args[2].toString().slice(0, -1)) <= 0)
      return message.channel.send('The number of winners cannot be less than 1!');
    let giveawayChannel = message.mentions.channels.first();
    if (!giveawayChannel || !args[3]) return message.channel.send("**Please provide a channel to start the giveaway!**")
    let prize = args.slice(4).join(" ");
    if (!prize) return message.channel.send('**Please provide a prize!**');
    let startGiveawayEmbed = new Discord.MessageEmbed()
      .setAuthor(config.name, config.logo)
      .setThumbnail(config.logo)
      .setDescription("```" + `${prize}` + "```\n" + " > ***Κάντε reaction στο 🎉 για να συμμετάσχετε στο giveaway!***\n\n" + `**Το giveaway λήγει σε:** \`${duration}\`\n` + `**Hosted από τον/την:** <@${message.author.id}>\n` + `**Ποσό νικητών:**\`${winnerCount.toString().slice(0, -1)}\``)
      .setColor(config.color)
      .setTimestamp(Date.now() + ms(args[1]))
    giveawayChannel.send({ content: '@everyone', embeds: [startGiveawayEmbed] }).then(m => {
      m.react("🎉").catch(console.error);
      setTimeout(() => {
        if (m.reactions.cache.get("🎉").count <= 1) {
          const nooneGiveawayEmbed = new Discord.MessageEmbed()
            .setAuthor(config.name, config.logo)
            .setThumbnail(config.logo)
            .setDescription("```" + `${prize}` + "```\n" + " > ***Κάντε reaction στο 🎉 για να συμμετάσχετε στο giveaway!***\n\n" + `**Πήραν μέρος:** \`${m.reactions.cache.get("🎉").count - 1}\`\n` + `**Hosted από τον/την:** <@${message.author.id}>\n` + `**Νικητής:** \`\`Κανείς\`\``)
            .setColor(config.color)
          m.edit({ embeds: [nooneGiveawayEmbed] })
          return giveawayChannel.send("**Δεν  πήρε κανεις μερος**")
        }
        if (m.reactions.cache.get("🎉").count <= winnerCount.toString().slice(0, -1)) {
          return giveawayChannel.send("There's not enough people in the giveaway to satisfy the number of winners!")
        }
        let winner = m.reactions.cache.get("🎉").users.cache.filter((users) => !users.bot).random(winnerCount.toString().slice(0, -1));
        const endedEmbedGiveaway = new Discord.MessageEmbed()
          .setAuthor(config.name, config.logo)
          .setThumbnail(config.logo)
          .setDescription("```" + `${prize}` + "```\n" + " > ***Κάντε reaction στο 🎉 για να συμμετάσχετε στο giveaway!***\n\n" + `**Πήραν μέρος:** \`${m.reactions.cache.get("🎉").count - 1}\`\n` + `**Hosted από τον/την:** <@${message.author.id}>\n` + `**Νικητής:** ${winner}`)
          .setColor(config.color)
          .setTimestamp(Date.now() + ms(args[1]))
        const embed = new Discord.MessageEmbed()
          .setTitle("Giveaway Result")
          .setDescription(`**ο/οι νικητής/νικητές του Giveaway είναι: ${winner}**`)
          .setColor(config.color)
        const reroll = new Discord.MessageButton()
          .setEmoji("🔁")
          .setStyle("SECONDARY")
          .setLabel("Reroll")
          .setCustomId("reroll")
        const row = new Discord.MessageActionRow()
          .addComponents(reroll)
        giveawayChannel.send({ embeds: [embed], components: [row] })
        m.edit({ embeds: [endedEmbedGiveaway] });
      }, ms(args[1]));
      //
      client.on('interactionCreate', async interaction => {
        if (!interaction.isButton()) return;
        //reroll button
        if (interaction.customId === 'reroll') {
          let winner = m.reactions.cache.get("🎉").users.cache.filter((users) => !users.bot).random(winnerCount.toString().slice(0, -1));
          const noperms = new Discord.MessageEmbed()
            .setAuthor(config.name, config.logo)
            .setColor(config.color)
            .setDescription(`**Δεν μπορείς να κανείς Reroll**`)
          if (!interaction.member.permissions.has('ADMINISTRATOR')) return interaction.reply({ embeds: [noperms], ephemeral: true })
          const embed = new Discord.MessageEmbed()
            .setTitle("Giveaway Rerolled")
            .setDescription(`**ο/οι νικητής/νικητές του Giveaway είναι: ${winner}**`)
            .setColor(config.color)
            .setFooter(`Rerolled By : ${interaction.user.tag}`)
          const reroll = new Discord.MessageButton()
            .setEmoji("🔁")
            .setStyle("SECONDARY")
            .setLabel("Reroll")
            .setCustomId("reroll")
          const row = new Discord.MessageActionRow()
            .addComponents(reroll)
          interaction.reply({ embeds: [embed], components: [row] })
          interaction.message.edit({ components: [] })
          const endedEmbedGiveaway = new Discord.MessageEmbed()
            .setAuthor(config.name, config.logo)
            .setThumbnail(config.logo)
            .setDescription("```" + `${prize}` + "```\n" + " > ***Κάντε reaction στο 🎉 για να συμμετάσχετε στο giveaway!***\n\n" + `**Πήραν μέρος:** \`${m.reactions.cache.get("🎉").count - 1}\`\n` + `**Hosted από τον/την:** <@${message.author.id}>\n` + `**Νικητής:** ${winner}`)
            .setColor(config.color)
            .setTimestamp(Date.now() + ms(args[1]))

          m.edit({ embeds: [endedEmbedGiveaway] });
        }


      })
    })
  }
})



client.on('guildMemberAdd', (member) => {
  const user = member.user
  const channelID = member.guild.channels.cache.get(config.joinlogs)
  const guild = member.guild.id
  const memberEmbed = new Discord.MessageEmbed()
    .setAuthor(member.user.username, member.user.displayAvatarURL(), "https://discord.com/users/" + member.user.id)
    .setDescription(` \`\`\` Join \`\`\` \n**Register**: \`${moment(member.user.createdAt).format("MMM Do YYYY").toLocaleString()}\`\n**Mention:** <@!${member.user.id}>`)
    .setColor('GREEN')
  const role = member.guild.roles.cache.get(config.autorole)//auto role
  member.roles.add(role).catch(() => { })
  channelID.send({ embeds: [memberEmbed] })
})
client.on('guildMemberRemove', (member) => {
  const monitorID = member.guild.channels.cache.get(config.leavelogs)//left logs
  const guild = member.guild.id
  const memberEmbed = new Discord.MessageEmbed()
    .setColor('RED')
    .setDescription(` \`\`\` Leave \`\`\` \n**Register**: \`${moment(member.user.createdAt).format("MMM Do YYYY").toLocaleString()}\`\n**Mention:** <@!${member.user.id}>`)
    .setAuthor(member.user.username, member.user.displayAvatarURL(), "https://discord.com/users/" + member.user.id)
    .setImage('')
  monitorID.send({ embeds: [memberEmbed] })
})
////// Message Edit Logs \\\\\\
client.on("messageUpdate", async (oldMessage, newMessage) => {
  try {
    if (newMessage.author.bot) return
    let channel = oldMessage.guild.channels.cache.get(config.msglogs)
    const url = oldMessage.url
    const embed = new Discord.MessageEmbed()
      .setTitle(`Edited Message Logs`)
      .setColor('#993366')
      .setTimestamp()
      .setURL(url)
      .addField(`Παλιο μυνημα`, `*${oldMessage.content}*`, false)
      .addField(`Τελικο μυνημα`, `*${newMessage.content}*`, false)
      .addField(`Το μυνημα ειναι του`, `**<@${oldMessage.author.id}>**`, true)
      .addField(`Καναλι που ηταν το μυνημα`, `**<#${oldMessage.channel.id}>**`, true)
    channel.send({ embeds: [embed] }).catch(() => { })
  } catch {

  }
})
var temporary = [];

////// Message Delete \\\\\\
client.on('messageDelete', async message => {
  if (!message.guild) return;
  const fetchedLogs = await message.guild.fetchAuditLogs({
    limit: 1,
    type: 'MESSAGE_DELETE',
  });
  const deletionLog = fetchedLogs.entries.first();
  const embed = new Discord.MessageEmbed({
    "author": {
      "name": message.author.tag,
      "url": "https://discord.com/users/" + message.author.id,
      "icon_url": message.author.displayAvatarURL()
    },
    "color": 15483204,
    "description": "​\n" + message.content + "\n\n**Author : <@" + message.author.id + ">\nChannel : <#" + message.channel.id + ">**"
  })
  if (!deletionLog) return client.channels.cache.get(config.msglogs).send({ embeds: [embed] })

  const { executor, target } = deletionLog;
  const embed2 = new Discord.MessageEmbed({
    "author": {
      "name": message.author.tag,
      "url": "https://discord.com/users/" + message.author.id,
      "icon_url": message.author.displayAvatarURL()
    },
    "color": 15483204,
    "description": "​\n" + message.content + "\n\n**Author : <@" + message.author.id + ">\nChannel : <#" + message.channel.id + ">**\n**Deleted By : <@" + executor.id + ">**"
  })
  const embed3 = new Discord.MessageEmbed({
    "author": {
      "name": message.author.tag,
      "url": "https://discord.com/users/" + message.author.id,
      "icon_url": message.author.displayAvatarURL()
    },
    "color": 15483204,
    "description": "​\n" + message.content + "\n\n**Author : <@" + message.author.id + ">\nChannel : <#" + message.channel.id + ">**"
  })
  try {
    if (target.id == message.author.id) {
      client.channels.cache.get(config.msglogs).send({ embeds: [embed2] }).catch(() => { })
    } else {
      client.channels.cache.get(config.msglogs).send({ embeds: [embed3] }).catch(() => { })
    }
  } catch {

  }
});

//voice logs
var temporary = [];
client.on('voiceStateUpdate', (oldMember, newMember) => {
  let newUserChannel = newMember.channelId;
  let oldUserChannel = oldMember.channelId;


  try {
    if (newUserChannel) {
      const voicelogs = newMember.guild.channels.cache.get(config.voicelogs)
      const voicee = new Discord.MessageEmbed({
        "author": {
          "name": newMember.member.user.tag,
          "url": "https://discord.com/users/" + newMember.member.user.id,
          "icon_url": newMember.member.user.displayAvatarURL()
        },
        "color": 4371328,
        "description": "**Κανάλι: <#" + newUserChannel + "> • " + newMember.channel.name + "\nMention: <@" + newMember.member.user.id + ">**"
      })
      voicelogs.send({ embeds: [voicee] })
    }

    else {
      if (oldUserChannel) {
        const voicelogs = oldMember.guild.channels.cache.get(config.voicelogs)
        const voice = new Discord.MessageEmbed({
          "author": {
            "name": newMember.member.user.tag,
            "url": "https://discord.com/users/" + newMember.member.user.id,
            "icon_url": newMember.member.user.displayAvatarURL()
          },
          "color": 15681608,
          "description": "**Κανάλι: <#" + oldUserChannel + "> • `" + oldMember.channel.name + "`\nMention: <@" + oldMember.member.user.id + ">**"
        })
        voicelogs.send({ embeds: [voice] })
      }
    }
  } catch {
    e => console.log(e.message)
  }
})





////// Role Create-Delete Logs \\\\\\
client.on("roleCreate", async (role) => {
  const fetchedLogs = await role.guild.fetchAuditLogs({
    limit: 1,
    type: 'ROLE_CREATE',
  });

  const fasdfa = fetchedLogs.entries.first();
  let { executor, target, reason } = fasdfa;
  if (executor === null) executor = "\u200B";
  if (target === null) target = "\u200B";
  if (reason === null) reason = "\u200B";

  const embed = new Discord.MessageEmbed()
    .setColor("GREEN")
    .setAuthor(executor.username, executor.displayAvatarURL(), `https://discord.com/users/${executor.id}`)
    .setDescription("A new role was created!")
    .addFields(
      { name: "User", value: executor.username },
      { name: "Role Name", value: target.name },
      { name: "Role ID", value: target.id },
      { name: "reason", value: reason }
    )
    // .setFooter(`Role ID: ${id}`)
    .setTimestamp();

  client.channels.cache.get(config.rolelogs).send({ embeds: [embed] }).catch(() => { })
})
client.on("roleDelete", async (role) => {

  const fetchedLogs = await role.guild.fetchAuditLogs({
    limit: 1,
    type: 'ROLE_DELETE',
  });

  const fasdfa = await fetchedLogs.entries.first();
  let { executor, target, reason, a } = fasdfa;
  if (executor === null) executor = "\u200B";
  if (target === null || target === undefined) target = "\u200B";
  if (reason === null) reason = "\u200B";

  const embed = new Discord.MessageEmbed()
    .setColor("RED")
    .setAuthor(executor.username, executor.displayAvatarURL(), `https://discord.com/users/${executor.id}`)
    .setDescription("A new role was Deleted!")
    .addFields(
      { name: "User", value: executor.username },
      { name: "Role Name", value: role.name },
      { name: "Role ID", value: role.id },
      { name: "reason", value: reason }
    )
    // .setFooter(`Role ID: ${id}`)
    .setTimestamp();

  client.channels.cache.get(config.rolelogs).send({ embeds: [embed] })

});
//role update
client.on('guildMemberUpdate', async function (oldMember, newMember) {
  const log = await newMember.guild.fetchAuditLogs({ limit: 1, type: 'MEMBER_ROLE_UPDATE' }).then(logs => logs.entries.first());
  let addedRoles = newMember.roles.cache.filter(role => !oldMember.roles.cache.has(role.id));
  let removedRoles = oldMember.roles.cache.filter(role => !newMember.roles.cache.has(role.id));

  if (removedRoles.size > 0) {
    const removeRoleEmbed = new Discord.MessageEmbed()
      .setColor('RED')
      .setAuthor(`${oldMember.user.tag}`, oldMember.user.avatarURL())
      .setDescription(`<@!${oldMember.id}> lost role <@&${removedRoles.map(r => r.id)}> from <@!${log.executor.id}>`)
      .setTimestamp()
      .setFooter(`ID : ${oldMember.id}`)
    client.channels.cache.get(config.rolelogs).send({ embeds: [removeRoleEmbed] })
  }

  if (addedRoles.size > 0) {
    const addRoleEmbed = new Discord.MessageEmbed()
      .setColor('GREEN')
      .setAuthor(`${oldMember.user.tag}`, oldMember.user.avatarURL())
      .setDescription(`<@!${oldMember.id}> got role <@&${addedRoles.map(r => r.id)}> from <@!${log.executor.id}>`)
      .setTimestamp()
      .setFooter(`ID : ${oldMember.id}`)
    client.channels.cache.get(config.rolelogs).send({ embeds: [addRoleEmbed] })
  }
});
//channel create
client.on("channelCreate", async function (channel) {
  const logs = await channel.guild.fetchAuditLogs({ limit: 1, type: 'CHANNEL_CREATE' });
  const log = logs.entries.first();
  if (!log) return;
  const embed = new Discord.MessageEmbed()
    .setAuthor(config.name, config.logo)
    .setColor("GREEN")
    .setDescription(`**Author : <@!${log.executor.id}>\nChannel Name : \`${channel.name}\`\nChannel Type : \`${channel.type}\`**`)
  client.channels.cache.get(config.channellogs).send({ embeds: [embed] })
});
//channel delete
client.on("channelDelete", async function (channel) {
  const logs = await channel.guild.fetchAuditLogs({ limit: 1, type: 'CHANNEL_DELETE' });
  const log = logs.entries.first();
  if (!log) return;
  const embed = new Discord.MessageEmbed()
    .setAuthor(config.name, config.logo)
    .setColor("RED")
    .setDescription(`**Author : <@!${log.executor.id}>\nChannel Name : \`${channel.name}\`\nChannel Type : \`${channel.type}\`**`)

  client.channels.cache.get(config.channellogs).send({ embeds: [embed] })
});

client.on('guildMemberRemove', async member => {
  const logs = await member.guild.fetchAuditLogs({ limit: 1, type: 'MEMBER_KICK' });
  const log = logs.entries.first();
  const { reason } = log;

  if (!log) return;
  const embed = new Discord.MessageEmbed()
    .setColor("RED")
    .setDescription(`${member.user} **kicked**\n\nΑπό τον/την : ${log.executor}\nΛόγος : ${reason || `No Reason`}`)
  if (Date.now() - log.createdTimestamp < 5000) {
    client.channels.cache.get(config.kicklogs).send({ embeds: [embed] })

  }
})
//ban logs
client.on('guildBanAdd', async ban => {
  const logs = await ban.guild.fetchAuditLogs({ limit: 1, type: 'MEMBER_BAN_ADD' });
  const log = logs.entries.first();
  const { reason } = log;
  if (!log) return;
  const embed = new Discord.MessageEmbed()
    .setColor("RED")
    .setDescription(`${ban.user} **banned**\n\nΑπό τον/την : ${log.executor}\nΛόγος : ${reason || `No Reason`}`)
  if (Date.now() - log.createdTimestamp < 5000) {
    client.channels.cache.get(config.banlogs).send({ embeds: [embed] })
  }
})
//unban logs
client.on('guildBanRemove', async member => {
  const logs = await member.guild.fetchAuditLogs({ limit: 1, type: 'MEMBER_BAN_REMOVE' });
  const log = logs.entries.first();
  const { reason } = log;
  if (!log) return;
  const embed = new Discord.MessageEmbed()
    .setColor("RED")
    .setDescription(`${member.user} **unbanned**\n\nΑπό τον/την : ${log.executor}`)
  if (Date.now() - log.createdTimestamp < 5000) {
    client.channels.cache.get(config.banlogs).send({ embeds: [embed] })


  }
})
//invite logs
client.on("inviteCreate", async invite => {
  const inv = await invite.guild.fetchAuditLogs({ limit: 1, type: 'INVITE_CREATE' });
  const inv2 = inv.entries.first();
  const embed = new Discord.MessageEmbed()
    .setColor(`GREEN`)
    .setDescription(`**\`\`\`New Invite\`\`\`**\n\n**Invite By: ${inv2.executor}\nInvite Channel: ${invite.channel}\n\nInvite Link: ||discord.gg/${invite.code}||**`)
  client.channels.cache.get(config.invite).send({ embeds: [embed] })
});
client.on("inviteDelete", async invite => {
  const inv = await invite.guild.fetchAuditLogs({ limit: 1, type: 'INVITE_DELETE' });
  const inv2 = inv.entries.first();
  const embed = new Discord.MessageEmbed()
    .setColor(`RED`)
    .setDescription(`**\`\`\`Invite Delete\`\`\`**\n\n**Invite Deleted By: ${inv2.executor}\n\nInvite Link: ||discord.gg/${invite.code}||**`)
  client.channels.cache.get(config.invite).send({ embeds: [embed] })
});

client.on("message", async message => {
  if (message.content.includes("https://") || message.content.includes("discord.gg") || message.content.includes("discord.com/invite") || message.content.includes("discord.io") || message.content.includes(".gg") || message.content.includes(".io")) {
    if (message.member.permissions.has("MANAGE_MESSAGES")) return;
    message.delete()
    let cont = ""
    cont += message.content
    const antilink = client.channels.cache.get(config.antilink)
    const embed = new Discord.MessageEmbed()
      .setTitle("🛑Anti Invite Alert🛑")
      .setColor(config.color)
      .setDescription(`**\nAuthor : <@${message.member.user.id}> \nUser ID : \`${message.member.user.id}\`\nInvite Link : \n\`\`\`${cont}\`\`\`**`)
      .setFooter(config.name, config.logo)

    antilink.send({ embeds: [embed] })
  }
})

const alt = {

  "time": config.alttime,
  "logs": config.antialt

}
client.on('guildMemberAdd', (member, message) => {
  const logs = member.guild.channels.cache.get(alt.logs)
  if (Date.now() - member.user.createdAt < 1000 * 60 * 60 * alt.time * 1) {

    const embed = new Discord.MessageEmbed()
      .setTitle("**Anti Alt System**")
      .setDescription(`**🆘Εντοπίστηκε νέος Alt λογαριασμός.🆘\nㅤ**\nΌνομα : ${member.user}\n\nID : ${member.id}\n\nΔημιουργήθηκε στις : ${moment(member.user.createdAt).format("MMM Do YYYY").toLocaleString()}`)
      .setColor("RED")
      .setTimestamp();
    const koumpi = new Discord.MessageButton()
      .setEmoji("🦵")
      .setStyle("DANGER")
      .setLabel("Kick")
      .setCustomId("kick_alt")
    const row = new Discord.MessageActionRow()
      .addComponents(koumpi)
    logs.send({ embeds: [embed], components: [row] }).then(msg => {
      db.set(`${msg.id}_${member.id}_alt`, true)
    })
    client.on('interactionCreate', async interaction => {
      if (!interaction.isButton()) return;
      if (interaction.customId === 'kick_alt') {
        const klotsia = db.get(`${interaction.message.id}_${member.id}_alt`)
        if (klotsia === true) {

          const embed = new Discord.MessageEmbed()
            .setTitle("**Anti Alt System**")
            .setDescription(`**🆘Εντοπίστηκε νέος Alt λογαριασμός.🆘\nㅤ**\nΌνομα : ${member.user}\n\nID : ${member.id}\n\nΔημιουργήθηκε στις : ${moment(member.user.createdAt).format("MMM Do YYYY").toLocaleString()}\n\nΟ Alt λογαριασμός έγινε kicked απο τον/την ${interaction.member}`)
            .setColor("RED")
            .setTimestamp();
          const koumpi = new Discord.MessageButton()
            .setEmoji("🦵")
            .setStyle("DANGER")
            .setLabel("Kick")
            .setCustomId("222222")
            .setDisabled(true)
          const row = new Discord.MessageActionRow()
            .addComponents(koumpi)
          interaction.update({ embeds: [embed], components: [row], ephemeral: true }).catch(() => { })
          member.send(`**Έγινες kick από τον ${interaction.guild.name}, επειδή είσαι Alt λογαριασμός.**`)
          member.kick(`Alt Account`)



        }
      }

    })
  }
})

//Ticket System
client.on('messageCreate', message => {
  if (message.content.toLowerCase() === '!ticket') {
    if (!message.member.permissions.has("ADMINISTRATOR")) {
      message.delete()
    }
    else {
      message.delete()
      const embed = new Discord.MessageEmbed()
        .setAuthor(config.name, config.logo)
        .setDescription(`**To open a ticket press the "📩" button and we will serve you immediately.**`)
        .setTitle(`Tickets | Contact us`)
        .setThumbnail(config.logo)
        .setColor(config.color);
      const ticketopen = new Discord.MessageButton()
        .setStyle('SECONDARY')
        .setLabel('📩')
        .setCustomId('ticket_open');
      const row = new Discord.MessageActionRow()
        .addComponents(ticketopen)

      message.channel.send({ embeds: [embed], components: [row] })
    }
  }
})
////////////////////////////////////////////////////////////////
client.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return;
  if (interaction.customId === 'ticket_open') {
    const embed = new Discord.MessageEmbed()
      .setTitle("Ticket Anti Spam")
      .setDescription("**You already have a Ticket open.**")
      .setColor(config.color)
    const limembe = new Discord.MessageEmbed()
      .setTitle("🛡️Ticket Protection")
      .setColor(config.color)
      .setDescription(`ο/η ${interaction.user} προσπαθεί να ανοίξει δεύτερο Ticket.`)

    if (client.guilds.cache.get(interaction.guildId).channels.cache.find(c => c.topic == interaction.user.id)) {
      return interaction.reply({
        embeds: [embed],
        ephemeral: true
      }),
        client.channels.cache.get(config.ticketlogs).send({ embeds: [limembe] })


    } interaction.reply({ ephemeral: true }).catch(() => { })
    interaction.guild.channels.create(`🎫ticket-${interaction.user.username}`, {
      parent: config.ticketparent,
      topic: interaction.user.id,
      permissionOverwrites: [{
        id: interaction.user.id,
        allow: ['VIEW_CHANNEL'],
        deny: ['SEND_MESSAGES'],
      },
      {
        id: interaction.guild.roles.everyone,
        deny: ['VIEW_CHANNEL'],
      },
      ],
      type: 'text',
    }).catch(() => { }).then(async c => {
      const embed = new Discord.MessageEmbed()
        .setAuthor(config.name, config.logo)
        .setColor(config.color)
        .setDescription("**Please specify the topic to which your problem belongs.**")
        .setThumbnail(config.logo)
      const row = new Discord.MessageActionRow()
        .addComponents(
          new Discord.MessageSelectMenu()
            .setCustomId("category")
            .setPlaceholder("Click here to set the Ticket topic.")
            .addOptions([{
              label: 'Buy',
              value: '💵Buy',
              emoji: '💵',
              },
              {
                label: 'Replace',
                value: '📦Replace',
                emoji: '📦'
              },
              {
              label: 'Question',
              value: '❓Question',
              emoji: '❓',
              },
              {
                label: 'Cancel Ticket',
                value: 'cancel_ticket',
                description: 'To cancel your Ticket.',
                emoji: '⛔',
              },
            ]),
        );

      msg = await c.send({ embeds: [embed], components: [row] }).catch(() => { })
      msg = await c.send({
        content: `<@!${interaction.user.id}>`,
      }).then(msg => {
        msg.delete().catch(() => { })
      })



    })

  }
})
client.on('interactionCreate', async interaction => {
  if (!interaction.isSelectMenu()) return;
  if (interaction.values[0] === '💵Buy') {

    interaction.reply({ ephemeral: true }).catch(() => { })
    interaction.channel.bulkDelete(5)
    interaction.channel.permissionOverwrites.set([
      {
        id: interaction.user.id,
        allow: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
      },
      {
        id: config.ticketrole,
        allow: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
      },
      {
        id: interaction.guild.roles.everyone,
        deny: ['VIEW_CHANNEL'],
      },
    ])
    interaction.channel.setName(`${interaction.values}-${interaction.user.username}`)
    const embed = new Discord.MessageEmbed()
      .setDescription(`**Describe your problem in detail and wait for a staff member to serve you.**`)
      .setFooter('To close the Ticket press "🔒Close"')
      .setColor(config.color)
      .setAuthor(interaction.user.tag + " ● " + interaction.values, interaction.user.displayAvatarURL())
    const closebutton = new Discord.MessageButton()
      .setStyle('DANGER')
      .setLabel('\🔒Close')
      .setCustomId('ticket_close');
    const row = new Discord.MessageActionRow()
      .addComponents(closebutton)
    interaction.channel.send({ embeds: [embed], components: [row] })
    const log_embed = new Discord.MessageEmbed()

      .setTitle("🔨New Ticket")
      .setThumbnail("https://cdn.discordapp.com/attachments/959870995626360902/960208729138139196/loggericon.png")
      .setDescription("**Άνοιξε από τον/ην : <@!" + interaction.channel.topic + ">\n\n Θέμα : " + interaction.values + "\n\n Κανάλι : <#" + interaction.channel.id + ">**")
      .setColor(config.color)
    client.channels.cache.get(config.ticketlogs).send({ embeds: [log_embed] })
  }

  if (interaction.values[0] === '📦Replace') {

    interaction.reply({ ephemeral: true }).catch(() => { })
    interaction.channel.bulkDelete(5)
    interaction.channel.permissionOverwrites.set([
      {
        id: interaction.user.id,
        allow: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
      },
      {
        id: config.ticketrole,
        allow: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
      },
      {
        id: interaction.guild.roles.everyone,
        deny: ['VIEW_CHANNEL'],
      },
    ])
    interaction.channel.setName(`${interaction.values}-${interaction.user.username}`)
    const embed = new Discord.MessageEmbed()
      .setDescription(`**Describe your problem in detail and wait for a staff member to serve you.**`)
      .setFooter('To close the Ticket press "🔒Close"')
      .setColor(config.color)
      .setAuthor(interaction.user.tag + " ● " + interaction.values, interaction.user.displayAvatarURL())
    const closebutton = new Discord.MessageButton()
      .setStyle('DANGER')
      .setLabel('\🔒Close')
      .setCustomId('ticket_close');
    const row = new Discord.MessageActionRow()
      .addComponents(closebutton)
    interaction.channel.send({ embeds: [embed], components: [row] })
    const log_embed = new Discord.MessageEmbed()
      .setTitle("🔨New Ticket")
      .setThumbnail("https://cdn.discordapp.com/attachments/959870995626360902/960208729138139196/loggericon.png")
      .setDescription("**Άνοιξε από τον/ην : <@!" + interaction.channel.topic + ">\n\n Θέμα : " + interaction.values + "\n\n Κανάλι : <#" + interaction.channel.id + ">**")
      .setColor(config.color)
    client.channels.cache.get(config.ticketlogs).send({ embeds: [log_embed] })
  }

  if (interaction.values[0] === '❓Question') {

    interaction.reply({ ephemeral: true }).catch(() => { })
    interaction.channel.bulkDelete(5)
    interaction.channel.permissionOverwrites.set([
      {
        id: interaction.user.id,
        deny: ['SEND_MESSAGES'],
        allow: ['VIEW_CHANNEL'],
      },
      {
        id: config.ticketrole, //staff team
        allow: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
      },
      {
        id: interaction.guild.roles.everyone,
        deny: ['VIEW_CHANNEL'],
      },
    ])
    interaction.channel.setName(`${interaction.values}-${interaction.user.username}`)
    const embed = new Discord.MessageEmbed()
      .setDescription(`**Describe your problem in detail and wait for a staff member to serve you.**`)
      .setFooter('To close the Ticket press "🔒Close"')
      .setColor(config.color)
      .setAuthor(interaction.user.tag + " ● " + interaction.values, interaction.user.displayAvatarURL())
    const closebutton = new Discord.MessageButton()
      .setStyle('DANGER')
      .setLabel('\🔒Close')
      .setCustomId('ticket_close');
    const claim = new Discord.MessageButton()
      .setStyle('SUCCESS')
      .setLabel('〢Staff Respond')
      .setCustomId('ticket_claim')
      .setEmoji(`1076802217836814346`)
    const row = new Discord.MessageActionRow()
      .addComponents(claim)
      .addComponents(closebutton)

    interaction.channel.send({ embeds: [embed], components: [row] })
    const log_embed = new Discord.MessageEmbed()
      .setTitle("🔨New Ticket")
      .setThumbnail("https://cdn.discordapp.com/attachments/959870995626360902/960208729138139196/loggericon.png")
      .setDescription("**Άνοιξε από τον/ην : <@!" + interaction.channel.topic + ">\n\n Θέμα : " + interaction.values + "\n\n Κανάλι : <#" + interaction.channel.id + ">**")
      .setColor(config.color)
    client.channels.cache.get(config.ticketlogs).send({ embeds: [log_embed] })
    interaction.channel.send({ content: `<@&${config.ticketrole}>` }).then(msg => {
      msg.delete();
    })
  }

  if (interaction.values[0] === 'cancel_ticket') {

    interaction.reply({ ephemeral: true }).catch(() => { })

    const log_embed = new Discord.MessageEmbed()
      .setTitle("⛔Cancel Ticket")
      .setThumbnail("https://cdn.discordapp.com/attachments/959870995626360902/960208729138139196/loggericon.png")
      .setDescription("**Άνοιξε από τον/ην : <@!" + interaction.channel.topic + ">\n\n Ακυρώθηκε από τον/ην : " + `${interaction.member}**`)
      .setColor(config.color)
    client.channels.cache.get(config.ticketlogs).send({ embeds: [log_embed] })
    interaction.channel.delete()
  }
  //telos apo values 

})
client.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return;
  if (interaction.customId === 'ticket_claim') {
    if (!interaction.member.roles.cache.get(config.ticketrole)) return interaction.reply({ content: `**<a:warning35:1083322863639076884> Don't Try To Abuse**`, ephemeral: true })
    //
    db.add(`claims_${interaction.guild.id}.${interaction.member.id}.total`, 1)
    interaction.channel.permissionOverwrites.set([
      {
        id: interaction.user.id,
        allow: ['VIEW_CHANNEL', 'SEND_MESSAGES'],
      },
      {
        id: config.ticketrole, //staff team
        deny: ['SEND_MESSAGES'],
        allow: ['VIEW_CHANNEL'],
      },
      {
        id: interaction.channel.topic,
        allow: ['VIEW_CHANNEL', 'SEND_MESSAGES'],
      },
      {
        id: interaction.guild.roles.everyone,
        deny: ['VIEW_CHANNEL'],
      },
    ])
    interaction.reply({ content: `✅`, ephemeral: true })
    const closebutton = new Discord.MessageButton()
      .setStyle('DANGER')
      .setLabel('\🔒Close')
      .setCustomId('ticket_close');
    const claim = new Discord.MessageButton()
      .setStyle('SUCCESS')
      .setLabel('〢Staff Respond')
      .setCustomId('ticket_claim')
      .setEmoji(`1076802217836814346`)
      .setDisabled(true)
    const row = new Discord.MessageActionRow()
      .addComponents(claim)
      .addComponents(closebutton)
    interaction.message.edit({ components: [row] })
    interaction.channel.send(`**<@${interaction.channel.topic}> Your Ticket Has Been Checked By ${interaction.member} <a:976858303181242388:1076894002810454046>**`)

    const embed = new Discord.MessageEmbed()
      .setTitle("✅Claim Ticket")
      .setThumbnail("https://cdn.discordapp.com/attachments/959870995626360902/960208729138139196/loggericon.png")
      .setDescription(`**Το Ticket του <@${interaction.channel.topic}> έγινε Claim από τον ${interaction.member}**`)
      .setColor(config.color)
      .setTimestamp()
    client.channels.cache.get(config.claimlogs).send({ embeds: [embed] })
  }
})
//ticket close
client.on("interactionCreate", async interaction =>{
  if(interaction.isButton()){
    if(interaction.customId === "ticket_close"){

      const messages = await interaction.channel.messages.fetch({ limit: 100 });
      const formattedMessages = [...messages.values()]
      .filter(msg => !msg.author.bot)
      .map((msg) => `${msg.author.tag} - ${msg.content}`);
        let text; 
      if (formattedMessages.length === 0) {
        text = 'Το κανάλι δεν έχει κανένα μήνυμα.';
        } else {
        text = formattedMessages.reverse().join('\n');}

 fs.writeFile(`text.txt`, text, () => {
        client.channels.cache.get(config.ticketlogs).send({
         files: [`text.txt`],
        }).then(() => {
          fs.unlinkSync(`text.txt`);
        }).catch(() => {interaction.channel.delete().catch(() => { })})
      })
    }
  }
})
//telos

client.on("message", async message => {
  //leaderboard command
  if (message.content.startsWith("!claims") || message.content.startsWith("!staffteam")) {

    if (!message.member.permissions.has("ADMINISTRATOR")) return
    var data = db.get(`claims_${message.guild.id}`) || {};



    const guilds = Object.keys(data).map(_data => {
      return {
        Id: _data,
        Value: (data[_data].total || 0)
      };
    }).sort((x, y) => y.Value - x.Value);

    const generateEmbed = start => {
      const current = guilds.slice(start + 0, start + 40)

      const tes = start + 40
      const embed = new Discord.MessageEmbed()

        .setAuthor(message.guild.name, message.guild.iconURL())
      db.set(`leaderboardtset_${message.guild.id}`, start)
      let content = "";

      current.forEach(g => {

        const i = db.add(`leaderboardtset_${message.guild.id}`, 1)
        content += `\`${i}.\` <@!${g.Id}> ` + `<a:Right:1124834915469496341>` + ` \`${g.Value}\`\n`
      }
      )

      embed.setDescription(content).setColor(config.color).setFooter("Total Claims Leaderboard")
      return embed
    }




    message.channel.send({ embeds: [generateEmbed(0)] })
  }


})

client.on('messageCreate', async (message) => {
  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  if (command === 'reset') {
    if (!message.member.permissions.has("ADMINISTRATOR")) return message.reply({ content: "**Χρειάζεται να έχεις Administrator**", ephemeral: true })
    message.delete()
    let arena = db.all()
      .map(entry => entry.ID)
      .filter(id => id.startsWith(`claims_`))
    arena.forEach(db.delete)
    message.channel.send(`✅`)

  }
})

client.on('ready', () => {
  client.application.commands.create(
    {
      name: 'claims',
      description: `To open claims menu`
    },
    config.id
  );
  client.on('interactionCreate', async (interaction) => {

    if (interaction instanceof Discord.CommandInteraction && interaction.commandName === 'claims') {
      if (!interaction.member.permissions.has("ADMINISTRATOR")) return interaction.reply({ content: "**Χρειάζεται να έχεις Administrator**", ephemeral: true })

      const koumpi1 = new Discord.MessageButton()
        .setStyle("SUCCESS")
        .setLabel("Change Claims")
        .setCustomId("add_claims")
      const koumpi3 = new Discord.MessageButton()
        .setStyle("DANGER")
        .setLabel("Remove Claims")
        .setCustomId("remove_claims")
      const row = new Discord.MessageActionRow()
        .addComponents(koumpi1)




      interaction.reply({ components: [row], ephemeral: true })


    }
  })
})
client.on('interactionCreate', async (interaction) => {
  if (interaction.isButton()) {
    if (interaction.customId === 'add_claims') {
      const modal = new Modal()
        .setCustomId('add_claims_2')
        .setTitle(`Change Claims`)
        .addComponents([
          new Discord.MessageActionRow().addComponents(
            new TextInputComponent()
              .setCustomId('user')
              .setLabel('User Id')
              .setStyle('SHORT')
              .setMinLength(17)
              .setMaxLength(18)
              .setRequired(true),
          ),
          new Discord.MessageActionRow().addComponents(
            new TextInputComponent()
              .setCustomId('number')
              .setLabel('Number')
              .setStyle('SHORT')
              .setMinLength(1)
              .setMaxLength(5)
              .setRequired(true),
          ),

        ]);

      await interaction.showModal(modal);
    }
  }

  if (interaction.isModalSubmit()) {
    if (interaction.customId === 'add_claims_2') {

      interaction.reply({ content: `✅`, ephemeral: true })
      const user = interaction.fields.getTextInputValue('user')
      const number = interaction.fields.getTextInputValue('number')
      db.set(`claims_${interaction.guild.id}.${user}.total`, number)

    }
  }
});

//ticket with claims ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

//add emoji
client.on('messageCreate', async (message) => {
  if (message.content.indexOf(prefix) !== 0) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  if (command === 'addemoji') {
    if (message.author.bot) return;
    if (!message.member.permissions.has('ADMINISTRATOR')) return message.reply("**You do not have permissions.**")
    if (!args.length) return message.channel.send('?')


    for (const emojis of args) {
      const getEmoji = Discord.Util.parseEmoji(emojis);

      if (getEmoji.id) {
        const emojiExt = getEmoji.animated ? ".gif" : ".png";
        const emojiURL = `https://cdn.discordapp.com/emojis/${getEmoji.id + emojiExt}`;
        message.guild.emojis
          .create(emojiURL, getEmoji.name)
          .then(emoji =>
            message.channel.send({ content: `${emoji}` }))

      }
    }
  }
})

client.on('messageCreate', async (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();
  if (command === 'create_keys') {
    if (!message.member.permissions.has('ADMINISTRATOR')) return
    const letters = '1234567890QERTYUIOPASDFGHJKLZXCVBNM';
    let randomString = '!@#$%^&*()_+';
    for (let i = 0; i < 16; i++) {
      const randomIndex = Math.floor(Math.random() * letters.length);
      randomString += letters[randomIndex];
    }
    message.member.send(`${randomString}`)
    db.set(`${randomString}_key`, true)
  }
})
///redeem
client.on('ready', async () => {
  const commandData = {
    name: 'redeem',
    description: 'To Redeem Key',
    options: [
      {
        name: 'key',
        description: 'Type Your Key',
        type: 'STRING',
        required: true,
      },

    ],
  };
  client.application.commands.create(commandData)
});
/////
client.on("messageCreate", async message => {
  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  if (command === "pay") {
    if (!message.member.permissions.has("ADMINISTRATOR")) {
    }
    const payment = new Discord.MessageEmbed()
      .setAuthor(config.name, config.logo)
      .setColor(config.color)
      .setThumbnail(config.logo)
      .setDescription(`**Pαypαl Lιnκ --> https://paypal.me/palukasbusiness`)

    message.channel.send({ embeds: [payment] }).then(m => message.delete({ timeout: 1500 }))
  }
})


client.on("guildMemberAdd", async (member , guild) => {
  const channel = member.guild.channels.cache.get(config.welcomesystem)
  const welcome = new MessageEmbed()
    .setColor(config.color)
    .setDescription(`**<@${member.id}> Welcome To Exclusive Shop \n\n Total Members : \`${client.guilds.cache.get("1124833887902769256").memberCount}\`**`)
    .setAuthor(config.name, config.logo)
    .setThumbnail(config.logo)

  channel.send({ embeds: [welcome] })
})


client.on("messageCreate", async message => {
  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  if (command === "chrisvan") { 
  const embed = new MessageEmbed()
  .setAuthor(config.name, config.logo)
  .setTitle("Verify in Palukas Store")
  .setDescription(`To get access to the rest of the server, click on the verify button`)
  .setColor(config.color)
const button = new MessageButton()
  .setStyle("LINK")
  .setLabel('Verify')
  .setURL(`https://restorecord.com/verify/Palukas%20Store`)

const row = new MessageActionRow()
  .addComponents(button)
  message.channel.send({ embeds: [embed], components: [row] })
  }
})


client.on('ready', () => {
  client.application.commands.create(
    {
      name: 'leaderboard',
      description: `Για να δεις ολων τα invites μεσα στον server`
    },
    config.id
  );
  client.on('interactionCreate', async (interaction) => {
    if (interaction instanceof Discord.CommandInteraction && interaction.commandName === 'leaderboard') {
      const usersPerPage = 10;
      const data = db.get(`invites_${interaction.guild.id}`) || {};
      const guilds = Object.keys(data)
      .map(_data => {
        return {
          Id: _data,
          Regular: (data[_data].regular || 0),
          Fake: (data[_data].fake || 0),
          Total: (data[_data].total || 0),
          Leave: (data[_data].leave || 0)
        };
      })
      .sort((x, y) => y.Regular - x.Regular);
        if (guilds.length === 0) {
          return interaction.reply("**Το Leaderboard είναι άδειο.**");
        }
      const generateEmbed = (start, pageNumber) => {
        const startIndex = start + (pageNumber - 1) * usersPerPage;
        const current = guilds.slice(startIndex, startIndex + usersPerPage);
        const totalPages = Math.ceil(guilds.length / usersPerPage);
        const embed = new Discord.MessageEmbed()
          .setColor(config.color)
          .setAuthor(config.name,config.logo)
          .setDescription(
            current
              .map((g, index) => {
                const i = startIndex + index + 1;
                return `\`${i}.\` <@!${g.Id}> <a:Right:1084400336606855168> **${(g.Regular || 0)}** Invites. (**${(g.Total || 0)}** συνολικά, **${(g.Leave || 0)}** έχουν αποχωρήσει, **${(g.Fake || 0)}** ψεύτικα)\n`;
              })
              .join("")
          )
          .setFooter(`Σελίδα ${pageNumber}/${totalPages}`);
  
        const row = new Discord.MessageActionRow();
  
        const previousButton = new Discord.MessageButton()
          .setCustomId("previous_inv")
          .setEmoji("<a:left:1109078990028820510>")
          .setStyle("SECONDARY")
          .setDisabled(pageNumber === 1);
  
        const nextButton = new Discord.MessageButton()
          .setCustomId("next_inv")
          .setEmoji("<a:Right:1084400336606855168>")
          .setStyle("SECONDARY")
          .setDisabled(pageNumber === totalPages);
  
  
  
        row.addComponents(previousButton, nextButton);
  
        return { embeds: [embed], components: [row] };
      };
  
      const msg = await interaction.channel.send(generateEmbed(0, 1));
  
      const filter = i => i.user.id === message.author.id;
      const collector = msg.createMessageComponentCollector({ filter, time: 60000 });
  
      collector.on("collect", i => {
        const currentPageNumber = parseInt(
          i.message.embeds[0].footer.text.match(/Σελίδα (\d+)\/(\d+)/)[1]
        );
        if (i.customId === "previous_inv") {
          msg.edit(generateEmbed(0, currentPageNumber - 1));
        } else if (i.customId === "next_inv") {
          msg.edit(generateEmbed(0, currentPageNumber + 1));
        }
        i.deferUpdate();
      });
  
      collector.on("end", collected => {
        msg.edit({ components: [] });
      });

    }
  })
});


client.on('inviteCreate', async invite => {
  const invites = await invite.guild.invites.fetch();
  const codeUses = new Map();
  invites.each(inv => codeUses.set(inv.code, inv.uses, inv.inviter));

  guildInvites.set(invite.guild.id, codeUses);
})

client.once('ready', () => {
  client.guilds.cache.forEach(guild => {
    guild.invites.fetch()
      .then(invites => {

        const codeUses = new Map();
        invites.each(inv => codeUses.set(inv.code, inv.uses, inv.inviter));

        guildInvites.set(guild.id, codeUses);
      })
      .catch(err => {
        console.log("OnReady Error:", err)
      })
  })
})

client.on('guildMemberAdd', async member => {
  const cachedInvites = guildInvites.get(member.guild.id)
  const newInvites = await member.guild.invites.fetch();
  try {
    const usedInvite = newInvites.find(inv => cachedInvites.get(inv.code) < inv.uses);
  
    const inviter = client.users.cache.get(usedInvite.inviter.id);
    const embed0 = new Discord.MessageEmbed()
      .setTitle("Invite Logs")
      .setColor(config.color)
      .setDescription(`Ο/Η ${member} (${member.user.username}) μπήκε στον server από την πρόσκληση (${usedInvite.code || "δεν υπάρχει πλέον"}) του ${inviter} (${inviter.username}) **αλλά είναι Fake**`)
    var fake22 = (Date.now() - member.user.createdAt < 1000*60*60*24*10) //return client.channels.cache.get(config.invites).send({embeds: [embed0] }),db.add(`total_${inviter.id}`, 1),db.add(`fake_${inviter.id}`, 1)
    const embed = new Discord.MessageEmbed()
      .setTitle("Invite Logs")
      .setColor(config.color)
      .setDescription(`Ο/Η ${member} (${member.user.username}) μπήκε στον server από την πρόσκληση (${usedInvite.code || "δεν υπάρχει πλέον"}) του ${inviter} (${inviter.username})`)
    client.channels.cache.get(config.invites).send({ embeds: [embed] })
    if (inviter) {
      db.set(`invites_${member.guild.id}.${member.id}.inviter`, inviter.id);
      if (fake22) {
        _fake = db.add(`invites_${member.guild.id}.${inviter.id}.fake`, 1);
        db.set(`${member.id}.inv`, `${inviter.id}`)
      }
      else {
        total = db.add(`invites_${member.guild.id}.${inviter.id}.total`, 1);
        regular = db.add(`invites_${member.guild.id}.${inviter.id}.regular`, 1);
        db.set(`${member.id}.inv`, `${inviter.id}`)
      }
    }
    //console.log(`The code ${usedInvite.code} was just used by ${member.user.username}. ${inviter.username}`)
  } catch (err) {

  }

  newInvites.each(inv => cachedInvites.set(inv.code, inv.uses));
  guildInvites.set(member.guild.id, cachedInvites);
});
client.on("guildMemberRemove", async (member) => {
  if (!member.guild.me.permissions.has("ADMINISTRATOR")) return;

  const inviter = db.get(`${member.id}.inv`)


  var total = 0, regular = 0, fakecount = 0, data = db.get(`invites_${member.guild.id}.${member.id}`);
  if (!data) {
    const embed = new Discord.MessageEmbed()
      .setAuthor(member.user.username, member.user.displayAvatarURL(), "https://discord.com/users/" + member.user.id)
      .setDescription(`Ο/Η ${member} (${member.user.username}) βγήκε από τον server. Είχε μπει από τον <@${inviter}>`)
      .setColor(config.color)
    member.guild.channels.cache.get(config.invites).send({embeds: [embed]});
    db.delete(`${member.id}.inv`)
    return;
  }

  if (data.isfake && data.inviter) {
    fakecount = db.subtract(`invites_${member.guild.id}.${data.inviter}.fake`, 1);
    total = db.subtract(`invites_${member.guild.id}.${data.inviter}.total`, 1);
  }
  else if (data.inviter) {
    regular = db.subtract(`invites_${member.guild.id}.${data.inviter}.regular`, 1);
    total = db.subtract(`invites_${member.guild.id}.${data.inviter}.total`, 1);
  }
  if (data.inviter) bonus = db.get(`invites_${member.guild.id}.${data.inviter}.bonus`) || 0;


  db.add(`invites_${member.guild.id}.${data.inviter}.leave`, 1);


  const channel = member.guild.channels.cache.get(config.invites)
  if (channel) {
    const embed = new Discord.MessageEmbed()
      .setTitle("Invite Logs")
      .setColor(config.color)
      .setDescription(`Ο/Η ${member} (${member.user.username}) βγήκε από τον server. Είχε μπει από τον <@${inviter}>`)
    channel.send({embeds: [embed]});
    db.delete(`${member.id}.inv`)
  }
})
  client.on("messageCreate", async message =>{

  if (message.content.startsWith("!invites") || message.content.startsWith("!inv")) {
    var victim = message.mentions.users.first() || message.author;
    //
    var data = db.get(`invites_${message.guild.id}.${victim.id}`) || { total: 0, fake: 0, inviter: null, regular: 0, leave: 0 };
    //const left = db.get(`invites_${message.guild.id}.${victim.id}.leave`)
    var embed0 = new Discord.MessageEmbed()
      .setAuthor(victim.username, victim.displayAvatarURL())
      //.setDescription(`**Total : \`${(data.total || 0)}\` | Regular : \`${(data.regular || 0)}\` | Fake : \`${(data.fake || 0)}\` | Left : \`${(data.leave || 0)}\`**`)
      .setDescription(`**Βρέθηκαν \`${(data.regular || 0)}\` invites για τον/ην <@${victim.id}> (**${data.total || 0}** συνολικά, **${data.leave || 0}** έχουν αποχωρήσει, **${data.fake || 0}** ψεύτικα)**`)
      .setColor(config.color)
    //
    if (!victim) return message.channel.send({ embeds: [embed0] });

    var data2 = db.get(`invites_${message.guild.id}.${victim.id}`) || { total: 0, fake: 0, inviter: null, regular: 0, leave: 0 };
    //const left = db.get(`invites_${message.guild.id}.${victim.id}.leave`)
    var embed = new Discord.MessageEmbed()
      .setAuthor(victim.username, victim.displayAvatarURL(), "https://discord.com/users/" + victim.id)
      //.setDescription(`**Total : \`${(data.total || 0)}\` | Regular : \`${(data.regular || 0)}\` | Fake : \`${(data.fake || 0)}\` | Left : \`${(data.leave || 0)}\`**`)
      .setColor(config.color)
      .setThumbnail(config.logo)
      .setDescription(`**Βρέθηκαν \`${(data.regular || 0)}\` invites για τον/ην <@${victim.id}> (**${data.total || 0}** συνολικά, **${data.leave || 0}** έχουν αποχωρήσει, **${data.fake || 0}** ψεύτικα)**`)
    message.channel.send({ embeds: [embed] });
  }

})

client.on("messageCreate", async message =>{
  if(message.content.startsWith("!get-promo")){

    const embed = new Discord.MessageEmbed()
    .setColor(config.color)
    .setAuthor(config.name , config.logo)
    .setDescription("**Pack 1: **3€ \n \`10 Days\` \n Ping @here \n\n **Pack 2: **5€ \n \`15 Days\` \n Ping @everyone \n\n **Pack 3: **10€\n \`30 Days\` \n Ping @everyone (every week)")
    .setThumbnail(config.logo)

    const row = new Discord.MessageActionRow()
    .addComponents(
      new Discord.MessageButton()
      .setCustomId("get-promo")
      .setLabel("Get A Promo")
      .setEmoji("")
      .setStyle("SECONDARY")

     )
      message.channel.send({embeds : [embed], components : [row]})
    
  }
})

  client.on("interactionCreate", async interaction => {
    if(interaction.isButton()){
      if(interaction.customId === "get-promo"){
          const promoembed = new Discord.MessageEmbed()
              .setAuthor(config.name , config.logo)
              .setColor(config.color)
              .setDescription("**Choose your promote pack!**")
              .setThumbnail(config.logo)

              const row = new Discord.MessageActionRow()
              .addComponents(
                new Discord.MessageSelectMenu()
                .setCustomId("tttttt")
                .setPlaceholder("Choose.")
                .setMinValues(1)
                .setMaxValues(1)
                .addOptions([{
                    label: 'Pack 1',
                    description: 'Custom Channel & Tag @here.',
                    value: "pack-1",
                    emoji: '',
                  },
                  {
                    label: 'Pack 2',
                    description: 'Custom Channel & Tag @everyone.',
                    value: "pack-2",
                    emoji: '',
                  },
                  {
                    label: 'Pack 3',
                    description: 'Custom Channel & Tag @everyone (every week).',
                    value: "pack-3",
                    emoji: '',
                  },
              
                ]),
              );
              
              interaction.reply({ embeds: [promoembed], components: [row], ephemeral: true})
      }
    }
  })

client.on("interactionCreate", async interaction => {
  if (!interaction.isSelectMenu())return;
  if (interaction.values[0] === 'pack-1') {
      interaction.reply({ ephemeral: true }).catch(() => { })
      const channel = await interaction.guild.channels.create(`🎟️promo-${interaction.user.username}`, {
        type: "text",
        parent: interaction.message.channel.parentId,

        parent : config.promoteparent,
        permissionOverwrites: [
          {
            id: interaction.guild.roles.everyone,
            deny: ['VIEW_CHANNEL']
        },
        {
            id: interaction.user.id,
            allow: ['VIEW_CHANNEL', "SEND_MESSAGES"]
        },
        {
          id: config['promoteallowedrole'],
          allow: ['VIEW_CHANNEL', 'SEND_MESSAGES']
      }
        ]
      })

      const ticketembed = new Discord.MessageEmbed()
      .setAuthor(config.name, config.logo)
      .setColor(config.color)
      .setDescription("**Παρακαλω περιμενετε το staff team θα σας εξυπηρετησει συντομα!!**")
      .setFooter("Για να κλείσετε το ticket πατήστε το 🔒")

      const ticketbtn = new Discord.MessageActionRow()
      .addComponents(
        new Discord.MessageButton()
        .setCustomId("cls-promo")
        .setEmoji("🔒")
        .setStyle("SECONDARY")
  
       )

      channel.send({embeds : [ticketembed], components : [ticketbtn]})
      channel.send({ content: `<@&${config.promoteallowedrole}>` }).then(msg => {
        msg.delete();
      })
    }
})

client.on("interactionCreate", async interaction => {
  if (!interaction.isSelectMenu())return;
  if (interaction.values[0] === 'pack-2') {
      interaction.reply({ ephemeral: true }).catch(() => { })
      const channel = await interaction.guild.channels.create(`🎟️promo-${interaction.user.username}`, {
        type: "text",
        parent: interaction.message.channel.parentId,

        parent : config.promoteparent,
        permissionOverwrites: [
          {
            id: interaction.guild.roles.everyone,
            deny: ['VIEW_CHANNEL']
        },
        {
            id: interaction.user.id,
            allow: ['VIEW_CHANNEL', "SEND_MESSAGES"]
        },
        {
          id: config['promoteallowedrole'],
          allow: ['VIEW_CHANNEL', 'SEND_MESSAGES']
      }
        ]
      })

      const ticketembed = new Discord.MessageEmbed()
      .setAuthor(config.name, config.logo)
      .setColor(config.color)
      .setDescription("**Παρακαλω περιμενετε το staff team θα σας εξυπηρετησει συντομα!!**")
      .setFooter("Για να κλείσετε το ticket πατήστε το 🔒")

      const ticketbtn = new Discord.MessageActionRow()
      .addComponents(
        new Discord.MessageButton()
        .setCustomId("cls-promo")
        .setEmoji("🔒")
        .setStyle("SECONDARY")
  
       )

      channel.send({embeds : [ticketembed], components : [ticketbtn]})
      channel.send({ content: `<@&${config.promoteallowedrole}>` }).then(msg => {
        msg.delete();
      })
    }
})

client.on("interactionCreate", async interaction => {
  if (!interaction.isSelectMenu())return;
  if (interaction.values[0] === 'pack-3') {
      interaction.reply({ ephemeral: true }).catch(() => { })
      const channel = await interaction.guild.channels.create(`🎟️promo-${interaction.user.username}`, {
        type: "text",
        parent: interaction.message.channel.parentId,

        parent : config.promoteparent,
        permissionOverwrites: [
          {
            id: interaction.guild.roles.everyone,
            deny: ['VIEW_CHANNEL']
        },
        {
            id: interaction.user.id,
            allow: ['VIEW_CHANNEL', "SEND_MESSAGES"]
        },
        {
          id: config['promoteallowedrole'],
          allow: ['VIEW_CHANNEL', 'SEND_MESSAGES']
      }
        ]
      })

      const ticketembed = new Discord.MessageEmbed()
      .setAuthor(config.name, config.logo)
      .setColor(config.color)
      .setDescription("**Παρακαλω περιμενετε το staff team θα σας εξυπηρετησει συντομα!!**")
      .setFooter("Για να κλείσετε το ticket πατήστε το 🔒")

      const ticketbtn = new Discord.MessageActionRow()
      .addComponents(
        new DiscordMessageButton()
        .setCustomId("cls-promo")
        .setEmoji("🔒")
        .setStyle("SECONDARY")
  
       )

      channel.send({embeds : [ticketembed], components : [ticketbtn]})
      channel.send({ content: `<@&${config.promoteallowedrole}>` }).then(msg => {
        msg.delete();
      })
    }
})

client.on("interactionCreate", async interaction =>{
  if(interaction.isButton()){
    if(interaction.customId === "cls-promo"){
      const messagereply = new Discord.MessageEmbed()
      .setColor(config.color)
      .setAuthor(interaction.user.username, config.logo)
      .setDescription(`**To ticket θα κλείσει σε 5 δευτερόλεπτα**`)

      interaction.reply({embeds : [messagereply]}).then(msg => {
        setTimeout(async () => {
          interaction.channel.delete()
        }, 5000)})
    }
    }
})

