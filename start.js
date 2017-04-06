var Botkit = require('botkit');
var request = require('request')
var _ = require('lodash')

var controller = Botkit.slackbot({debug: true});
//process.env.slacktoken = "xoxb-164038557296-rvVqOEvcmULcttMyqmN4BjFJ"
//process.env.slacktokenromulo = "xoxp-163887310278-163205285074-164611953904-5d6db1043d64cd83bdc3d292948dd6ad"
var bot = controller.spawn({
    token: process.env.slacktoken
}).startRTM();

// give the bot something to listen for.
controller.hears('hello',['direct_message','direct_mention','mention'],function(bot,message) {
   bot.reply(message,'Hello yourself.');
});

controller.on('channel_created', function(bot, message) {

    request.post({ url: 'https://slack.com/api/users.list', form: { token: process.env.slacktoken} }, function(err, res, body) {
      var bodyjson = eval('(' + body + ')')
      //var channelid = bodyjson.channel.id;
      //var members = ['haoyang', 'martina', 'romulo', 'kevin', 'bruce'];
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
        /*bot.say(
          {
              text: 'The channel ' + message.channel.name + ' was created and ' + member.real_name + ' was invited',
              channel: 'C4U0W08QP'
          }
        );*/

      });
      //request.post({ url: 'https://slack.com/api/channels.setTopic', form: { token: users.haoyang.slacktoken, channel: channelid, topic: purpose } });
      //request.post({ url: 'https://slack.com/api/channels.setPurpose', form: { token: users.haoyang.slacktoken, channel: channelid, topic: purpose } });
    });

  });

// U4T618D26 C4U0W08QP
//
/*
controller.on('ambient',function(bot,message) {

      bot.reply(message,{
              text: "A more complex response",
               username: "ReplyBot",
              icon_emoji: ":dash:",
      });

})

*/
