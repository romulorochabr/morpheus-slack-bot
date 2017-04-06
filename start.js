var Botkit = require('botkit');
var request = require('request')
var _ = require('lodash')

var controller = Botkit.slackbot({debug: true});

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
