// VERIFY ENV VARIABLES
if (!process.env.slacktoken) {
    console.log('Error: Specify token in environment')
    process.exit(1)
}

if (!process.env.slacktokenadmin) {
    console.log('Error: Specify admin token in environment')
    process.exit(1)
}

var Botkit    = require('botkit')
var _         = require('lodash')
var Store     = require("jfs")
var morOs     = require('./modules/morpheus-os.js')
var morColl   = require('./modules/morpheus-collect.js')
var morStore  = require('./modules/morpheus-store.js')
var morCommon = require('./modules/morpheus-common.js')
var morTodo   = require('./modules/morpheus-todo.js')

var db          = new Store("data",{pretty:true})
var controller  = Botkit.slackbot({debug: true})
var changed     = false // Allow backup rotine know if it is doing to backup or not

var bot = controller.spawn({
    token: process.env.slacktoken
}).startRTM()

// EVENTS HANDLERS
controller.on('channel_created', function(bot, message) {

  morStore.initializeStore(db, message.channel.id, false)
  morCommon.inviteAllUsersToChannel(message.channel.id)

})

controller.on('channel_deleted', function(bot, message) {
  morStore.deleteStore(message.channel)
})


// COLLECT COMMANDS FOR MORPHEUS - BEGIN
controller.hears([morCommon.COMMANDS.collectList],'direct_message,direct_mention,mention', function(bot, message) {
  bot.startConversation(message,function(err,convo) {
      morColl.collectList(bot , message, db, convo)
  })
})

controller.hears([morCommon.COMMANDS.collectAdd],'direct_message,direct_mention,mention', function(bot, message) {
  morColl.collectAdd(bot, message, db)
})

controller.hears([morCommon.COMMANDS.collectRemove],'direct_message,direct_mention,mention', function(bot, message) {
  morColl.collectRemove(bot, message, db)
})

controller.hears([morCommon.COMMANDS.collectClean],'direct_message,direct_mention,mention', function(bot, message) {
  morColl.collectClean(bot, message, db)
})

controller.hears([morCommon.COMMANDS.collectHelp],'direct_message,direct_mention,mention', function(bot, message) {
  morColl.collectHelp(bot, message)
})

controller.hears([morCommon.COMMANDS.collect],'direct_message,direct_mention,mention', function(bot, message) {
  morColl.collect(bot, message, db)
})

// COLLECT COMMANDS FOR MORPHEUS - END

// Todos COMMANDS FOR MORPHEUS - BEGIN
controller.hears([morCommon.COMMANDS.todoListAll],'direct_message,direct_mention,mention', function(bot, message) {
  morTodo.todoListAll(bot, message, db)
})

controller.hears([morCommon.COMMANDS.todoListDone],'direct_message,direct_mention,mention', function(bot, message) {
  morTodo.todoListDone(bot, message, db)
})

controller.hears([morCommon.COMMANDS.todoList],'direct_message,direct_mention,mention', function(bot, message) {
  morTodo.todoList(bot, message, db)
})

controller.hears([morCommon.COMMANDS.todoAdd],'direct_message,direct_mention,mention', function(bot, message) {
  morTodo.todoAdd(bot, message, db)
})

controller.hears([morCommon.COMMANDS.todoClean],'direct_message,direct_mention,mention', function(bot, message) {
  morTodo.todoClean(bot, message, db)
})

controller.hears([morCommon.COMMANDS.todoRemove],'direct_message,direct_mention,mention', function(bot, message) {
  morTodo.todoRemove(bot, message, db)
})

controller.hears([morCommon.COMMANDS.todoDone],'direct_message,direct_mention,mention', function(bot, message) {
  morTodo.todoDone(bot, message, db)
})

controller.hears([morCommon.COMMANDS.todoStrike],'direct_message,direct_mention,mention', function(bot, message) {
  morTodo.todoStrike(bot, message, db)
})

controller.hears([morCommon.COMMANDS.todoUnstrike],'direct_message,direct_mention,mention', function(bot, message) {
  morTodo.todoUnstrike(bot, message, db)
})

controller.hears([morCommon.COMMANDS.todoPrioritize],'direct_message,direct_mention,mention', function(bot, message) {
  morTodo.todoPrioritize(bot, message, db)
})

controller.hears([morCommon.COMMANDS.todoHelp],'direct_message,direct_mention,mention', function(bot, message) {
  morTodo.todoHelp(bot, message, db)
})

controller.hears([morCommon.COMMANDS.todo],'direct_message,direct_mention,mention', function(bot, message) {
  morTodo.todo(bot, message)
})

// TODO COMMANDS FOR MORPHEUS - END

controller.hears(['uptime', 'identify yourself', 'who are you', 'what is your name'],
                          'direct_message,direct_mention,mention', function(bot, message) {
  morOs.uptime(bot, message)
})

controller.hears(['shutdown'], 'direct_message,direct_mention,mention', function(bot, message) {
  morOs.shutdown(bot, message)
})

// Retrieves all the channels
morCommon.retrieveListOfActiveChannels()

// Backup routine
morOs.startBackupRoutine()

// Feature to start and take care of stale connections
function start_rtm() {
	bot.startRTM(function(err,bot,payload) {
		if (err) {
				console.log('Failed to start RTM')
				return setTimeout(start_rtm, 60000)
		}
		console.log("RTM started!")
	})
}
controller.on('rtm_close', function(bot, err) {
		console.log("RTM CLOSED : " + err)
		console.log("Trying to restart")
        start_rtm()
})

start_rtm()
