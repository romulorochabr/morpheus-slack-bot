

// VERIFY ENV VARIABLES
if (!process.env.slacktoken) {
    console.log('Error: Specify token in environment');
    process.exit(1);
}

if (!process.env.slacktokenadmin) {
    console.log('Error: Specify admin token in environment');
    process.exit(1);
}

var Botkit  = require('botkit')
var _       = require('lodash')
var Store   = require("jfs");
var mos     = require('./modules/morpheus-os.js')
var mosColl = require('./modules/morpheus-collect.js')
var mosStore = require('./modules/morpheus-store.js')
var mosCommon = require('./modules/morpheus-common.js')

var db      = new Store("data",{pretty:true});
var controller = Botkit.slackbot({debug: true});
var changed = false // Allow backup rotine know if it is doing to backup or not

var bot = controller.spawn({
    token: process.env.slacktoken
}).startRTM();

controller.on('ambient',function(bot,message) {

    // COLLECT ACTIONS
    if(message.text.startsWith(mosCommon.COMMANDS.collectAdd)){
      mosColl.collectAdd(bot , message, db)

    }else if(message.text.startsWith(mosCommon.COMMANDS.collectList)){
      mosColl.collectList(bot, message, db)

    }else if(message.text.startsWith(mosCommon.COMMANDS.collectRemove)){
      mosColl.collectRemove(bot, message, db)

    }else if(message.text.startsWith(mosCommon.COMMANDS.collectClean)){
      mosColl.collectClean(bot, message, db)

    }else if(message.text.startsWith(mosCommon.COMMANDS.collectHelp)){
      mosColl.collectHelp(bot, message, db)

    }else if(message.text.startsWith(mosCommon.COMMANDS.todoAdd)){
      bot.startConversation(message,function(err,convo) {

        mosCommon.sendMessageWIPInConv(convo)
        // Validates the message
        var data = message.text.split(' ')
        if(message.text.length <= (mosCommon.COMMANDS.todoAdd+1)){ // >= "todo add " = 9 characters
          // Send validation message
          convo.say('Sorry bro, but your message should be like todo add "description of your todo" [@user] [priority ****]')
          return
        }

        // Creates new obj
        var newCollect = {
          "description": message.text.substring((mosCommon.COMMANDS.todoAdd+1), message.text.length)
        }

        // Retrives the values
        var channelStore = message.channel
        db.get(channelStore, function(err, todosObj){
          if(err){
              console.log("GET ERROR: " + err)

              // initializes the collect store
              mosStore.initializeStore(db, channelStore, false, function(){
                convo.say('Hey mate, could you try again, now there is a place to store your todos!')
              })

          }else if(todosObj){ //
            // Add a new ideia
            todosObj.open.push(newCollect) // Add new collect to store

            // Save file
            db.save(channelStore, todosObj, function(err){
              if(err){
                convo.say('Hey mate, could you try again there was an error?')
              }else{
                convo.say('TODO added with success! New todo: ' + newCollect.description)
                changed = true
              }
            });

          }
        })
      })

    }else if(message.text.startsWith(mosCommon.COMMANDS.todoListDone)){
      bot.startConversation(message,function(err,convo) {

        mosCommon.sendMessageWIPInConv(convo)

        // Retrieve the data from collect store
        var channelStore = message.channel
        // TODO - Refactor creating a method to return the store
        db.get(channelStore, function(err, todosObj){
          if(err){
            console.log("GET ERROR: " + err)

            // initializes the collect store
            mosStore.initializeStore(db, channelStore, false, function(){
              convo.say('Hey mate, could you try again, now there is a place to store your todos!')
            })
          }else if(todosObj){
              // Send message
              var response = ""
              var index = 1;

              // Creates the list of items
              _.forEach(todosObj.done, function(todo) {
                response += '`' + index + '` ' + todo.description + '\n'
                index++
              })
              if(_.isEmpty(response))
                response = 'Hey dude, I havent found any item in your done todo list!'

              var formatted=   {
                  "attachments": [
                      {
                          "fallback": "Required plain-text summary of the attachment.",
                          "color": "#ffff33",
                          "text" : response,
                          "title": "Your List of DONE TODOs",
                          "image_url": "http://my-website.com/path/to/image.jpg",
                          "thumb_url": "http://example.com/path/to/thumb.png",
                          "mrkdwn_in": ["text"]
                      },
                      {
                          "fallback": "Required plain-text summary of the attachment.",
                          "footer": "Get things done and leave your brain in peace.",
                          "footer_icon": "https://platform.slack-edge.com/img/default_application_icon.png",
                    }
                  ]
              }
              convo.say(formatted)
          }
        })
      });
    }else if(message.text.startsWith((mosCommon.COMMANDS.todoListAll))){
      bot.startConversation(message,function(err,convo) {

        mosCommon.sendMessageWIPInConv(convo)

        // Retrieve the data from collect store
        var channelStore = message.channel

        db.get(channelStore, function(err, todosObj){
          if(err){
            console.log("GET ERROR: " + err)

            // initializes the collect store
            mosStore.initializeStore(db, channelStore, false, function(){
              convo.say('Hey mate, could you try again, now there is a place to store your todos!')
            })
          }else if(todosObj){
            if(todosObj.open.length == 0 && todosObj.done.length == 0){
              convo.say('Hey dude, I havent found any item in your todo list!')
              return
            }
              // Send message
              var responseOpen = ""
              var responseDone = ""
              var indexOpen = 1;
              var indexDone = 1;

              // Creates the list of items
              _.forEach(todosObj.open, function(todo) {
                responseOpen += '`' + indexOpen + '` ' + todo.description + '\n'
                indexOpen++
              })

              _.forEach(todosObj.done, function(todo) {
                responseDone += '`' + indexDone + '` ' + todo.description + '\n'
                indexDone++
              })

              // Confirme if response contains anything
              if(_.isEmpty(responseOpen))
                responseOpen = 'Hey dude, I havent found any item in your todo list!'
              // Confirme if response contains anything
              if(_.isEmpty(responseDone))
                responseDone = 'Hey dude, I havent found any item in your done todo list!'

              var formatted=   {
                  "attachments": [
                      {
                          "fallback": "Required plain-text summary of the attachment.",
                          "color": "#36a64f",
                          "text" : responseOpen,
                          "title": "Your List of TODOs",
                          "image_url": "http://my-website.com/path/to/image.jpg",
                          "thumb_url": "http://example.com/path/to/thumb.png",
                          "mrkdwn_in": ["text"]
                      },
                      {
                          "fallback": "Required plain-text summary of the attachment.",
                          "color": "#ffff33",
                          "text" : responseDone,
                          "title": "Your List of DONE TODOs",
                          "image_url": "http://my-website.com/path/to/image.jpg",
                          "thumb_url": "http://example.com/path/to/thumb.png",
                          "mrkdwn_in": ["text"]
                      },
                      {
                          "fallback": "Required plain-text summary of the attachment.",
                          "color": "#E0E0E0",
                          "text" : "You can *manage* your todos _items_ by typing `help`, `list [all|done|@user or word]`, `add`, `remove`, `done`, `strike` or `clean`.",
                          "mrkdwn_in": ["text"],
                          "footer": "Get things done and leave your brain in peace.",
                          "footer_icon": "https://platform.slack-edge.com/img/default_application_icon.png",
                      }
                  ]
              }
              convo.say(formatted)
          }
        })
      });
    }else if(message.text.startsWith((mosCommon.COMMANDS.todoList))){
      bot.startConversation(message,function(err,convo) {

        mosCommon.sendMessageWIPInConv(convo)

        // Retrieve the data from collect store
        var channelStore = message.channel

        db.get(channelStore, function(err, todosObj){
          if(err){
            console.log("GET ERROR: " + err)

            // initializes the collect store
            mosStore.initializeStore(db, channelStore, false, function(){
              convo.say('Hey mate, could you try again, now there is a place to store your todos!')
            })
          }else if(todosObj){
              // Send message
              var response = ''
              var index = 1
              //Verifies if there is any parameters to filter by
              var filter = ''
              if(message.text.length > 10) // There are addional parameters
                filter = message.text.substring(10, message.text.length)

              // Creates the list of items
              _.forEach(todosObj.open, function(todo) {
                if(filter.length > 0){
                  if(_.includes(todo.description, filter))
                    response += '`' + index + '` ' + todo.description + '\n'
                }else{
                  response += '`' + index + '` ' + todo.description + '\n'
                }
                index++
              });

              // Confirme if response contains anything
              if(_.isEmpty(response))
                response = 'Hey dude, I havent found any item in your todo list!'

              var formatted=   {
                  "attachments": [
                      {
                          "fallback": "Required plain-text summary of the attachment.",
                          "color": "#36a64f",
                          "text" : response,
                          "title": "Your List of TODOs",
                          "image_url": "http://my-website.com/path/to/image.jpg",
                          "thumb_url": "http://example.com/path/to/thumb.png",
                          "mrkdwn_in": ["text"]
                      },
                      {
                          "fallback": "Required plain-text summary of the attachment.",
                          "color": "#E0E0E0",
                          "text" : "You can *manage* your todos _items_ by typing `help`, `list [all|done|@user or word]`, `add`, `remove`, `done`, `strike` or `clean`.",
                          "mrkdwn_in": ["text"],
                          "footer": "Get things done and leave your brain in peace.",
                          "footer_icon": "https://platform.slack-edge.com/img/default_application_icon.png",
                      }
                  ]
              }
              convo.say(formatted)
          }
        })
      });
    }else if(message.text.startsWith(mosCommon.COMMANDS.todoRemove)){
      bot.startConversation(message,function(err,convo) {

        mosCommon.sendMessageWIPInConv(convo)
        // Validate the data
        if(message.text.length <= (mosCommon.COMMANDS.todoRemove.length+1)){
          // Send validation message
          convo.say('Sorry bro, but you should include the number to remove, like this "todo remove 1" (u can see the index using "todo list")')
          return

        }

        var data = message.text.substring( (mosCommon.COMMANDS.todoRemove.length+1), message.text.length) // Get the data after the command, eliminates the space
        console.log("DATA: " + data)
        var indexes = mosCommon.validateRangeOfNumber(data)
        if(indexes == null){ // the third parameter have to be an index
          console.log("Indexes null")
          convo.say('Sorry bro, but you should include the number to remove, like this "todo remove 1" (u can see the index using "todo list")')
          return
        }

        // Retrieve the data from collect store
        var channelStore = message.channel
        db.get(channelStore, function(err, todosObj){
          if(err){
            console.log("GET ERROR: " + err)

            // initializes the collect store
            mosStore.initializeStore(db, channelStore, false, function(){
              convo.say('Hey mate, could you try again, now there is a place to store your todos!')
            })
          }else if(todosObj){ //

            // sort the collection from higher to lower
            var revertedIndexes = _.chain(indexes.map(Number))
                                      .uniq()
                                      .sortBy()
                                      .value()
                                      .reverse()

            // Iterate throuht objects to remove
            console.log("Reverted index: " + revertedIndexes)
            _.forEach(revertedIndexes, function(index) {
              console.log("Excluding " + index);
              if(index > 0 && index <= todosObj.open.length){
                console.log('Excluding index: ' + index)
                todosObj.open.splice(index-1, 1)
              }
            });

            // Save file
            db.save(channelStore, todosObj, function(err){
              if(err){
                convo.say('Hey mate, could you try again, please? There was an error...')
              }else{
                convo.say('Item removed from todo list with success')
                changed = true
              }
            });
          }
        })
      })
    }else if(message.text.startsWith(mosCommon.COMMANDS.todoUnstrike)){
      bot.startConversation(message,function(err,convo) {

        mosCommon.sendMessageWIPInConv(convo)
        // Validate the data
        if(message.text.length <= (mosCommon.COMMANDS.todoUnstrike.length+1)){
          // Send validation message
          convo.say('Sorry bro, but your message should be like "todo unstrike 1" (u can see the index using "todo list")')
          return
        }

        var data = message.text.substring((mosCommon.COMMANDS.todoUnstrike.length+1), message.text.length) // Get the data after the command, eliminates the space
        console.log("DATA: " + data)
        var indexes = mosCommon.validateRangeOfNumber(data)
        if(indexes == null){ // the third parameter have to be an index
          console.log("Indexes null")
          convo.say('Sorry bro, but your message should be like "todo unstrike 1" (u can see the index using "todo list")')
          return
        }

        // Retrieve the data from collect store
        var channelStore = message.channel
        db.get(channelStore, function(err, todosObj){
          if(err){
            console.log("GET ERROR: " + err)

            // initializes the collect store
            mosStore.initializeStore(db, channelStore, false, function(){
              convo.say('Hey mate, could you try again, now there is a place to store your todos!')
            })
          }else if(todosObj){ //

            // sort the collection from higher to lower
            var revertedIndexes = _.chain(indexes.map(Number))
                                      .uniq()
                                      .sortBy()
                                      .value()
                                      .reverse()

            // Iterate throuht objects to remove
            console.log("Reverted index: " + revertedIndexes)
            _.forEach(revertedIndexes, function(index) {
              console.log("Unstriking " + index);
              if(index > 0 && index <= todosObj.open.length){
                console.log('Unstriking index: ' + index)
                var obj = todosObj.open[index -1]
                obj.description = _.replace(obj.description, new RegExp('~', 'g'), '')
                todosObj.open[index -1] = obj
              }
            });

            // Save file
            db.save(channelStore, todosObj, function(err){
              if(err){
                convo.say('Hey mate, could you try again, please? There was an error...')
              }else{
                convo.say('Item Unstrike from todo list with success')
                changed = true
              }
            });
          }
        })
      })

    }else if(message.text.startsWith(mosCommon.COMMANDS.todoStrike)){
      bot.startConversation(message,function(err,convo) {

        mosCommon.sendMessageWIPInConv(convo)
        // Validate the data
        if(message.text.length <= (mosCommon.COMMANDS.todoStrike.length+1)){
          // Send validation message
          convo.say('Sorry bro, but your message should be like "todo strike 1" (u can see the index using "todo list")')
          return
        }

        var data = message.text.substring((mosCommon.COMMANDS.todoStrike.length+1), message.text.length) // Get the data after the command, eliminates the space
        console.log("DATA: " + data)
        var indexes = mosCommon.validateRangeOfNumber(data)
        if(indexes == null){ // the third parameter have to be an index
          console.log("Indexes null")
          convo.say('Sorry bro, but your message should be like "todo strike 1" (u can see the index using "todo list")')
          return
        }

        // Retrieve the data from collect store
        var channelStore = message.channel
        db.get(channelStore, function(err, todosObj){
          if(err){
            console.log("GET ERROR: " + err)

            // mosStore.initializes the collect store
            mosStore.initializeStore(db, channelStore, false, function(){
              convo.say('Hey mate, could you try again, now there is a place to store your todos!')
            })
          }else if(todosObj){ //

            // sort the collection from higher to lower
            var revertedIndexes = _.chain(indexes.map(Number))
                                      .uniq()
                                      .sortBy()
                                      .value()
                                      .reverse()

            // Iterate throuht objects to remove
            console.log("Reverted index: " + revertedIndexes)
            _.forEach(revertedIndexes, function(index) {
              console.log("Striking " + index);
              if(index > 0 && index <= todosObj.open.length){
                console.log('Striking index: ' + index)
                var obj = todosObj.open[index -1]
                obj.description = '~' + obj.description + '~'
                todosObj.open[index -1] = obj
              }
            });

            // Save file
            db.save(channelStore, todosObj, function(err){
              if(err){
                convo.say('Hey mate, could you try again, please? There was an error...')
              }else{
                convo.say('Item strike from todo list with success')
                changed = true
              }
            });
          }
        })
      })
    }else if(message.text.startsWith(mosCommon.COMMANDS.todoDone)){

      bot.startConversation(message,function(err,convo) {

        mosCommon.sendMessageWIPInConv(convo)
        // Validate the data
        if(message.text.length <= (mosCommon.COMMANDS.todoDone.length+1)){
          // Send validation message
          convo.say('Sorry bro, but your message should be like "todo done 1" (u can see the index using "todo list")')
          return
        }

        var data = message.text.substring((mosCommon.COMMANDS.todoDone.length+1), message.text.length) // Get the data after the command, eliminates the space
        console.log("DATA: " + data)
        var indexes = mosCommon.validateRangeOfNumber(data)
        if(indexes == null){ // the third parameter have to be an index
          console.log("Indexes null")
          convo.say('Sorry bro, but your message should be like "todo done 1" (u can see the index using "todo list")')
          return
        }

        // Retrieve the data from collect store
        var channelStore = message.channel
        db.get(channelStore, function(err, todosObj){
          if(err){
            console.log("GET ERROR: " + err)

            // mosStore.initializes the collect store
            mosStore.initializeStore(db, channelStore, false, function(){
              convo.say('Hey mate, could you try again, now there is a place to store your todos!')
            })
          }else if(todosObj){ //

            // sort the collection from higher to lower
            var revertedIndexes = _.chain(indexes.map(Number))
                                      .uniq()
                                      .sortBy()
                                      .value()
                                      .reverse()

            // Iterate throuht objects to remove
            console.log("Reverted index: " + revertedIndexes)
            _.forEach(revertedIndexes, function(index) {
              console.log("Doneing " + index);
              if(index > 0 && index <= todosObj.open.length){
                console.log('Doneing index: ' + index)
                todosObj.done.push(todosObj.open[index-1])
                todosObj.open.splice(index-1, 1);
              }
            });

            // Save file
            db.save(channelStore, todosObj, function(err){
              if(err){
                convo.say('Hey mate, could you try again, please? There was an error...')
              }else{
                convo.say('Item done from todo list with success')
                changed = true
              }
            });
          }
        })
      })

    }else if(message.text.startsWith(mosCommon.COMMANDS.todoClean)){
      bot.startConversation(message,function(err,convo) {

        mosCommon.sendMessageWIPInConv(convo)
        var channelStore = message.channel
        mosStore.initializeStore(db, channelStore, false, () => {
          convo.say('The channel store cleaned with success.')
          changed = true
        })
      })
    }else if(message.text.startsWith(mosCommon.COMMANDS.todoPrioritize)){
      bot.startConversation(message,function(err,convo) {

        mosCommon.sendMessageWIPInConv(convo)
        // Validate the data
        if(message.text.length <= (mosCommon.COMMANDS.todoPrioritize.length +1)){
          // Send validation message
          convo.say('Sorry bro, but your message should be like "todo prioritize 5,1,3," (u can see the index using "todo list")')
          return
        }

        var data = message.text.substring((mosCommon.COMMANDS.todoPrioritize.length +1), message.text.length) // Get the data after the command, eliminates the space
        console.log("DATA: " + data)
        var indexes = mosCommon.validateRangeOfNumber(data)
        if(indexes == null){ // the third parameter have to be an index
          console.log("Indexes null")
          convo.say('Sorry bro, but your message should be like "todo doprioritizene 1" (u can see the index using "todo list")')
          return
        }

        // Retrieve the data from collect store
        var channelStore = message.channel
        db.get(channelStore, function(err, todosObj){
          if(err){
            console.log("GET ERROR: " + err)

            // mosStore.initializes the collect store
            mosStore.initializeStore(db, channelStore, false, function(){
              convo.say('Hey mate, could you try again, now there is a place to store your todos!')
            })
          }else if(todosObj){ //

            // sort the collection from higher to lower
            var orderedIndexes = _.chain(indexes.map(Number))
                                      .uniq()
                                      .value()

            // Iterate throuht objects to remove
            console.log("Ordered index: ")
            console.log(revertedIndexes)
            var oldList = Array.from(todosObj.open)
            todosObj.open = []
            _.forEach(orderedIndexes, function(index) {
              console.log("Prioritizing " + index)
              if(index > 0 && index <= oldList.length){
                console.log('prioritizing index: ' + index)
                todosObj.open.push(oldList[index-1])
              }
            })
            // Remove indexes already prioritized
            var revertedIndexes = _.chain(orderedIndexes)
                                        .sortBy()
                                        .value()
                                        .reverse()

            console.log('Filtering by already added')
            var lastingArrays = oldList.filter(function(obj, index){
              index++
              if(orderedIndexes.indexOf(index) > -1)
                return false
              else
                return true
            });

            _.forEach(lastingArrays, function(obj) {
              todosObj.open.push(obj)
            })

            // Save file
            db.save(channelStore, todosObj, function(err){
              if(err){
                convo.say('Hey mate, could you try again, please? There was an error...')
              }else{
                convo.say('Item prioritized from todo list with success')
                changed = true
              }
            });
          }
        })
      })

    }else if(message.text.startsWith(mosCommon.COMMANDS.todoHelp)){
      bot.reply(message, "TODO help!")
    }

})


// EVENTS HANDLERS
controller.on('channel_created', function(bot, message) {

  mosStore.initializeStore(db, message.channel.id, false)
  mosCommon.inviteAllUsersToChannel(message.channel.id)

});

controller.on('channel_deleted', function(bot, message) {
  mosStore.deleteStore(message.channel)
});


// COLLECT COMMANDS FOR MORPHEUS
controller.hears([mosCommon.COMMANDS.collectList],'direct_message,direct_mention,mention', function(bot, message) {
  mosColl.collectList(bot, message, db)
});

controller.hears([mosCommon.COMMANDS.collectAdd],'direct_message,direct_mention,mention', function(bot, message) {
  mosColl.collectAdd(bot, message, db)
});

controller.hears([mosCommon.COMMANDS.collectRemove],'direct_message,direct_mention,mention', function(bot, message) {
  mosColl.collectRemove(bot, message, db)
});

controller.hears([mosCommon.COMMANDS.collectClean],'direct_message,direct_mention,mention', function(bot, message) {
  mosColl.collectClean(bot, message, db)
});

controller.hears([mosCommon.COMMANDS.collectHelp],'direct_message,direct_mention,mention', function(bot, message) {
  mosColl.collectHelp(bot, message)
});


// COLLECT COMMANDS FOR MORPHEUS

controller.hears(['uptime', 'identify yourself', 'who are you', 'what is your name'],
                          'direct_message,direct_mention,mention', function(bot, message) {
  mos.uptime(bot, message)
});

controller.hears(['shutdown'], 'direct_message,direct_mention,mention', function(bot, message) {
  mos.shutdown(bot, message)
})


// Backup routine
mos.startBackupRoutine()
