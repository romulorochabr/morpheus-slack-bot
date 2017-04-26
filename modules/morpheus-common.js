var request = require('request')

// Regex Validation
var regComma = new RegExp('^(?!,)(,?[0-9]+)+$')
var regSpace = new RegExp('^(?!,)(\\s?[0-9]+)+$')

var morpheusCommon =  {

  COMMANDS :  {
      collectList     : 'collect list',
      collectAdd      : 'collect add',
      collectRemove   : 'collect remove',
      collectClean    : 'collect clean',
      collectHelp     : 'collect help',

      todoList        : 'todo list',
      todoListAll     : 'todo list all',
      todoListDone    : 'todo list done',
      todoAdd         : 'todo add',
      todoRemove      : 'todo remove',
      todoClean       : 'todo clean',
      todoStrike      : 'todo strike',
      todoUnstrike    : 'todo unstrike',
      todoDone        : 'todo done',
      todoPrioritize  : 'todo prioritize',
      todoHelp        : 'todo help'
  },

  COLLECT_STORE_NAME : "collect" ,

  sendMessageWIPInConv : function(convo){
    convo.say("Working on your request...")
  },

  validateRangeOfNumber : value => {
    console.log("VALIDATE " + value)
    console.log(value.split(' '))
    if(regComma.test(value))
      return value.split(',')
    if(regSpace.test(value))
      return value.trim().split(' ')

    return null;
  },

  inviteAllUsersToChannel : (channelId) => {
    request.post({ url: 'https://slack.com/api/users.list', form: { token: process.env.slacktoken} }, function(err, res, body) {
      var bodyjson = eval('(' + body + ')')

      var members = bodyjson.members

      _.each(members, function(member) {
        request.post({ url: 'https://slack.com/api/channels.invite', form: { token: process.env.slacktokenadmin, channel: channelId, user: member.id} },
          function(err, res, body) {
            bot.say(
              {
                  text: 'Invinting ' + member.real_name + ' to join the Channel',
                  channel: channelId
              }
            )
          })
      })
    })
  }

}

module.exports = morpheusCommon
