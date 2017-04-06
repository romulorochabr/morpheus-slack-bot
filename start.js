var Botkit = require('botkit');
var request = require('request')
var _ = require('lodash')

var controller = Botkit.slackbot({debug: true});

var bot = controller.spawn({
    token: process.env.slacktoken
}).startRTM();


controller.on('ambient',function(bot,message) {
    
    // collect add "description of the insight"
    // collect list -> Retrives the ideas
    // collect remove index -> mark as moved to any project/channel

    // todo add "description of todo" [priority] [user]
    // todo list -> list channels todos
    // todo list all -> list all channels todos
    // todo list done -> list all todos already done
    // todo remove|tick|strike index

    // COLLECT ACTIONS
    if(message.text.startsWith("collect add")){
      bot.reply(message, "New collect added!")
    }
    if(message.text.startsWith("collect list")){
      bot.reply(message, "List of collects")
    }
    if(message.text.startsWith("collect remove")){
      bot.reply(message, "Remove collect")
    }
    
    // TODOs ACTIONS
    if(message.text.startsWith("todo add")){
      bot.reply(message, "New TODO added!")
    }
    if(message.text.startsWith("todo list")){
      bot.reply(message, "List of TODOs")
    }
    if(message.text.startsWith("todo remove")){
      bot.reply(message, "Remove TODO")
    }

    /*bot.reply(message,{
      text: "A more complex response for: " + JSON.stringify(message),
      username: "@morpheus",
      icon_emoji: ":dash:",
    });*/

})

controller.on('channel_created', function(bot, message) {

    request.post({ url: 'https://slack.com/api/users.list', form: { token: process.env.slacktoken} }, function(err, res, body) {
      var bodyjson = eval('(' + body + ')')
      
      var members = bodyjson.members
      _.each(members, function(member) {
        request.post({ url: 'https://slack.com/api/channels.invite', form: { token: process.env.slacktokenromulo, channel: message.channel.id, user: member.id} },
          function(err, res, body) {
            bot.say(
              {
                  text: 'Invinting ' + member.real_name + ' to join the Channel',
                  channel: message.channel.id
              }
            );
          })
      });
    });

  });
