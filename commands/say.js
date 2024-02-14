module.exports = {
    name: 'say',
    description: "This is a say command",
    execute(message, args, Discord){
        if(message.member.permissions.has("ADMINISTRATOR")){
        const sayMessage = args.join(" ");
        if(!sayMessage) return;
        message.delete().catch(err => console.log(err));
        message.channel.send(sayMessage);
  }else{        
        message.delete().catch(err => console.log(err));
    }
    }
  }