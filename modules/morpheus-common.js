var request = require('request')
var _         = require('lodash')

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

      todoList        : 'todo list',        // list #channel
      todoListAll     : 'todo list all',    // list all #channel
      todoListDone    : 'todo list done',
      todoAdd         : 'todo add',
      todoRemove      : 'todo remove',
      todoClean       : 'todo clean',
      todoStrike      : 'todo strike',
      todoUnstrike    : 'todo unstrike',
      todoDone        : 'todo done',
      todoPrioritize  : 'todo prioritize',
      todoHelp        : 'todo help'
      // Todo Conversation
      // 1) todo
          // What is the channel?
          //  -> Brings the list of todos
          // What do you want?
            // commands
            // End of the conversation
     //  2) todo #channel
          //  -> Brings the list of todos
          // What do you want?
            // commands
            // End of the conversation


  },

  COLLECT_STORE_NAME : "collect" ,

  LIST_OF_CHANNELS : {},

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
  },

  retrieveListOfActiveChannels : () => {
    request.post({ url: 'https://slack.com/api/channels.list', form: { token: process.env.slacktoken, exclude_archived: true, exclude_members: true}},
    function(err, res, body) {

      var bodyjson = eval('(' + body + ')')

      morpheusCommon.LIST_OF_CHANNELS = bodyjson.channels

    })
  },

  extractChannel : (message) => {
    var channel
    if(message){
      console.log("MESSAGE: " + message)
      message = message.trim()
      channel = message.substring(message.lastIndexOf("#")+1, message.length);
      channel = channel.substring(channel.indexOf("|"),0);
    }
    return channel.trim()
  },

  isChannelValid : (channel) => {
    var valid = false
    _.each(morpheusCommon.LIST_OF_CHANNELS, function(channelObj) {
      console.log(channelObj.name + " " + channelObj.id +" == " + channel + "\n")
      if(channelObj.id === channel){
        valid = true
        return false // gets out of each
      }
    })
    return valid
  }

}

module.exports = morpheusCommon
