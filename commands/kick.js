const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'kick',
    description: "This command kick a member!",
    execute(message, args, Discord){

        const target = message.mentions.users.first();
   if(!message.member.permissions.has("ADMINISTRATOR"))return message.channel.send({content: "❌"})
        if(target){
            const memberTarget = message.guild.members.cache.get(target.id);
            memberTarget.kick().catch(()=>{})
            const newEmbed = new MessageEmbed()
            .setColor('RED')
            .setDescription("**"+target.tag+"** has been kicked\n\nModerator : <@"+message.author.id+">\n\n``Administrator with a higher role``")
            .setTimestamp()
            .setFooter('');

            message.channel.send({embeds: [newEmbed]});
        }else{        
        message.delete().catch(err => console.log(err));
    }
    }
  }