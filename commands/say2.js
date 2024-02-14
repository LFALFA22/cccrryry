const { MessageEmbed } = require('discord.js');
const { config } = require('process');

module.exports = {
    name: 'say2',
    description: "This is a say command",
    execute(message, args, Discord){
        if(message.member.permissions.has("ADMINISTRATOR")){
        const sayMessage = args.join(" ");
        if(!sayMessage) return;
        message.delete().catch(err => console.log(err));
        let messageArgs = args.join(' ');
        const newEmbed = new MessageEmbed()
        .setAuthor(message.guild.name, message.guild.iconURL({ format: "png" }))
          .setColor("#2F3136")
          .setThumbnail("https://media.discordapp.net/attachments/1112295163713310750/1112342157689376848/1685272861336.png")
          //.setImage("https://media.discordapp.net/attachments/1112295163713310750/1112333051486285965/20230528_145031.png")
          .setDescription(messageArgs);
          message.channel.send({embeds: [newEmbed]});
}else{        
        message.delete().catch(err => console.log(err));
    }
      }
    }