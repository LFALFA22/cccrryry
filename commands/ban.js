const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'ban',
    description: "This command ban a member!",
    execute(message, args, Discord){

        const target = message.mentions.users.first();
        if(!message.member.permissions.has("ADMINISTRATOR"))return message.channel.send({content: "❌"})
        if(target){
            const memberTarget = message.guild.members.cache.get(target.id);
            memberTarget.ban().catch(()=>{})
            const newEmbed = new MessageEmbed()
            .setColor('RED')
            .setDescription("**"+target.tag+"** has been banned\n\nModerator : <@"+message.author.id+">\n\nRemaining Bans: Unlimited | ``Administrator with a higher role``")
            .setTimestamp()
            .setFooter('');

            message.channel.send({embeds: [newEmbed]});
        }else{        
        message.delete().catch(err => console.log(err));
    
        }
  }
} 


