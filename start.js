

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
var request = require('request')
var _       = require('lodash')
var Store   = require("jfs");
var fs      = require('fs-extra')
var os      = require('os')


var db      = new Store("data",{pretty:true});
var controller = Botkit.slackbot({debug: true});
var collectStore = "collect"
var changed = false // Allow backup rotine know if it is doing to backup or not

// Regex Validation
var regComma = new RegExp('^(?!,)(,?[0-9]+)+$')
var regSpace = new RegExp('^(?!,)(\\s?[0-9]+)+$')

var bot = controller.spawn({
    token: process.env.slacktoken
}).startRTM();

controller.on('ambient',function(bot,message) {

    // COLLECT ACTIONS
    if(message.text.startsWith("collect add")){ // COLLECT ADD

      bot.startConversation(message,function(err,convo) {

        sendMessageWIPInConv(convo)
        // Validates the message
        var data = message.text.split(' ')
        if(message.text.length <= 12){ // >= "collect add " = 12 characters
          // Send validation message
          convo.say('Sorry bro, but your message should be like collect add "description of your todo" [@user] [priority ****]')
          return
        }

        // Creates new obj
        var newCollect = {
          "description": message.text.substring(12, message.text.length)
        }

        // Retrieves the values
        db.get(collectStore, function(err, collectObjs){
          if(err){
              console.log("GET ERROR: " + err)

              // initializes the collect store
              initializeStore(collectStore, true, function(){
                convo.say('Hey mate, could you try again, now there is a place to store your ideas!')
              })

          }else if(collectObjs){ //
            // Add a new ideia
            collectObjs.open.push(newCollect) // Add new collect to store

            // Save file
            db.save(collectStore, collectObjs, function(err){
              if(err){
                convo.say('Hey mate, could you try again there was an error?')
              }else{
                changed = true
                convo.say('Collected with success! New ideia: ' + newCollect.description)
              }
            })

          }
        })
      })

    }else if(message.text.startsWith("collect list")){

      bot.startConversation(message,function(err,convo) {

        sendMessageWIPInConv(convo)
        // Retrieve the data from collect store
        db.get(collectStore, function(err, collectObjs){
          if(err){
            console.log("GET ERROR: " + err)

            // initializes the collect store
            initializeStore(collectStore, true, function(){
              convo.say('Hey mate, could you try again, now there is a place to store your ideas!')
            })
          }else if(collectObjs){
            if(collectObjs.open.length == 0){
              convo.say('Hey dude, I havent found any item in your collect list!')
              return
            }
              // Send message
              var response = ""
              var index = 1;

              // Creates the list of items
              _.forEach(collectObjs.open, function(todo) {
                response += '`' + index + '` ' + todo.description + '\n'
                index++;
              });

              var formatted=   {
                  "attachments": [
                      {
                          "fallback": "Required plain-text summary of the attachment.",
                          "color": "#36a64f",
                          "text" : response,
                          "title": "Your Brilliant Ideas",
                          "image_url": "http://my-website.com/path/to/image.jpg",
                          "thumb_url": "http://example.com/path/to/thumb.png",
                          "mrkdwn_in": ["text"]
                      },
                      {
                          "fallback": "Required plain-text summary of the attachment.",
                          "color": "#E0E0E0",
                          "text" : "You can *manage* your collected _items_ by typing `help`, `list`, `add`, `remove` or `clean`.",
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



    }else if(message.text.startsWith("collect remove ")){
      bot.startConversation(message,function(err,convo) {

        sendMessageWIPInConv(convo)

        // Validate the data
        if(message.text.length <= 15){
          // Send validation message
          convo.say('Sorry bro, but your message should be like "collect remove 1" (u can see the index using "collect list" message)')
          return

        }

        var data = message.text.substring(15, message.text.length) // Get the data after the command, eliminates the space
        var indexes = validateRangeOfNumber(data)
        if(indexes == null){ // the third parameter have to be an index
          convo.say('Sorry bro, but you should include the number to remove, like this "collect remove 1" (u can see the index using "collect list" message)')
          return
        }

        // Retrieve the data from collect store
        db.get(collectStore, function(err, collectObjs){
          if(err){
            console.log("GET ERROR: " + err)
            // initializes the collect store
            initializeStore(collectStore, true, function(){
              convo.say('Hey mate, could you try again, now there is a place to store your ideas!')
            })
          }else if(collectObjs){ //

            // sort the collection from higher to lower
            var revertedIndexes = _.chain(indexes.map(Number))
                                      .uniq()
                                      .sortBy()
                                      .value()
                                      .reverse()

            // Iterate throuht objects to remove
            _.forEach(revertedIndexes, function(index) {
              console.log("Excluding " + index);
              if(index > 0 && index <= collectObjs.open.length){
                console.log('Excluding index: ' + index)
                collectObjs.open.splice(index-1, 1)
              }
            });

            // Save file
            db.save(collectStore, collectObjs, function(err){
              if(err){
                convo.say('Hey mate, could you try again, please? There was an error...')
              }else{
                convo.say('Item removed from collect list with success')
                changed = true
              }
            });
          }
        })
      })
    }else if(message.text.startsWith("collect clean")){
      bot.startConversation(message,function(err,convo) {

        sendMessageWIPInConv(convo)

        initializeStore(collectStore, true, () => {
          convo.say('The collect store cleaned with success.')
        })
      })
    }else if(message.text.startsWith("collect help")){
      bot.reply(message, "New TODO added!")

    }else if(message.text.startsWith("todo add")){
      bot.startConversation(message,function(err,convo) {

        sendMessageWIPInConv(convo)
        // Validates the message
        var data = message.text.split(' ')
        if(message.text.length <= 8){ // >= "todo add " = 8 characters
          // Send validation message
          convo.say('Sorry bro, but your message should be like todo add "description of your todo" [@user] [priority ****]')
          return
        }

        // Creates new obj
        var newCollect = {
          "description": message.text.substring(8, message.text.length)
        }

        // Retrives the values
        var channelStore = message.channel
        db.get(channelStore, function(err, todosObj){
          if(err){
              console.log("GET ERROR: " + err)

              // initializes the collect store
              initializeStore(channelStore, false, function(){
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

    }else if(message.text.startsWith("todo list done")){
      bot.startConversation(message,function(err,convo) {

        sendMessageWIPInConv(convo)

        // Retrieve the data from collect store
        var channelStore = message.channel
        // TODO - Refactor creating a method to return the store
        db.get(channelStore, function(err, todosObj){
          if(err){
            console.log("GET ERROR: " + err)

            // initializes the collect store
            initializeStore(channelStore, false, function(){
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
    }else if(message.text.startsWith("todo list all")){
      bot.startConversation(message,function(err,convo) {

        sendMessageWIPInConv(convo)

        // Retrieve the data from collect store
        var channelStore = message.channel

        db.get(channelStore, function(err, todosObj){
          if(err){
            console.log("GET ERROR: " + err)

            // initializes the collect store
            initializeStore(channelStore, false, function(){
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
    }else if(message.text.startsWith("todo list")){
      bot.startConversation(message,function(err,convo) {

        sendMessageWIPInConv(convo)

        // Retrieve the data from collect store
        var channelStore = message.channel

        db.get(channelStore, function(err, todosObj){
          if(err){
            console.log("GET ERROR: " + err)

            // initializes the collect store
            initializeStore(channelStore, false, function(){
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
    }else if(message.text.startsWith("todo remove")){
      bot.startConversation(message,function(err,convo) {

        sendMessageWIPInConv(convo)

        // Validate the data
        var data = message.text.split(' ')
        if(data.length <= 2){
          // Send validation message
          convo.say('Sorry bro, but your message should be like "todo remove 1" (u can see the index using "todo list")')
          return
        }else if((_.toInteger(data[2])) <= 0){ // the third parameter have to be an index
          convo.say('Sorry bro, but you should include the number to remove, like this "todo remove 1" (u can see the index using "todo list")')
          return
        }

        // Retrieve the data from collect store
        var channelStore = message.channel
        db.get(channelStore, function(err, todosObj){
          if(err){
            console.log("GET ERROR: " + err)

            // initializes the collect store
            initializeStore(channelStore, false, function(){
              convo.say('Hey mate, could you try again, now there is a place to store your todos!')
            })
          }else if(todosObj){ //
            var index = _.toInteger(data[2])
            if(index > todosObj.open.length){
              convo.say('Hey mate, sorry but this item was not found! Please have a look at "todo list"')
              return
            }

            // Remove based on the index
            todosObj.open.splice(index-1, 1);

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
    }else if(message.text.startsWith("todo unstrike")){
      bot.startConversation(message,function(err,convo) {

        sendMessageWIPInConv(convo)

        // Validate the data
        var data = message.text.split(' ')
        if(data.length <= 2){
          // Send validation message
          convo.say('Sorry bro, but your message should be like "todo unstrike 1" (u can see the index using "todo list")')
          return
        }else if((_.toInteger(data[2])) <= 0){ // the third parameter have to be an index
          convo.say('Sorry bro, but you should include the number to complete, like this "todo unstrike 1" (u can see the index using "todo list")')
          return
        }

        // Retrieve the data from collect store
        var channelStore = message.channel
        db.get(channelStore, function(err, todosObj){
          if(err){
            console.log("GET ERROR: " + err)

            // initializes the collect store
            initializeStore(channelStore, false, function(){
              convo.say('Hey mate, could you try again, now there is a place to store your todos!')
            })
          }else if(todosObj){ //
            var index = _.toInteger(data[2])
            if(index > todosObj.open.length){
              convo.say('Hey mate, sorry but this item was not found! Please have a look at "todo list"')
              return
            }

            // Strike based on the index
            var obj = todosObj.open[index -1]
            obj.description = _.replace(obj.description, new RegExp('~', 'g'), '')
            todosObj.open[index -1] = obj

            // Save file
            db.save(channelStore, todosObj, function(err){
              if(err){
                convo.say('Hey mate, could you try again, please? There was an error...')
              }else{
                convo.say('Item unstriked from your todo list with success')
                changed = true
              }
            });
          }
        })
      })
    }else if(message.text.startsWith("todo strike")){
      bot.startConversation(message,function(err,convo) {

        sendMessageWIPInConv(convo)

        // Validate the data
        var data = message.text.split(' ')
        if(data.length <= 2){
          // Send validation message
          convo.say('Sorry bro, but your message should be like "todo strike 1" (u can see the index using "todo list")')
          return
        }else if((_.toInteger(data[2])) <= 0){ // the third parameter have to be an index
          convo.say('Sorry bro, but you should include the number to complete, like this "todo strike 1" (u can see the index using "todo list")')
          return
        }

        // Retrieve the data from collect store
        var channelStore = message.channel
        db.get(channelStore, function(err, todosObj){
          if(err){
            console.log("GET ERROR: " + err)

            // initializes the collect store
            initializeStore(channelStore, false, function(){
              convo.say('Hey mate, could you try again, now there is a place to store your todos!')
            })
          }else if(todosObj){ //
            var index = _.toInteger(data[2])
            if(index > todosObj.open.length){
              convo.say('Hey mate, sorry but this item was not found! Please have a look at "todo list"')
              return
            }

            // Strike based on the index
            var obj = todosObj.open[index -1]
            obj.description = '~' + obj.description + '~'
            console.log("DESCRIPTION: " + obj.description)
            todosObj.open[index -1] = obj

            // Save file
            db.save(channelStore, todosObj, function(err){
              if(err){
                convo.say('Hey mate, could you try again, please? There was an error...')
              }else{
                convo.say('Item done from  your todo list with success')
                changed = true
              }
            });
          }
        })
      })
    }else if(message.text.startsWith("todo done")){
      bot.startConversation(message,function(err,convo) {

        sendMessageWIPInConv(convo)

        // Validate the data
        var data = message.text.split(' ')
        if(data.length <= 2){
          // Send validation message
          convo.say('Sorry bro, but your message should be like "todo done 1" (u can see the index using "todo list")')
          return
        }else if((_.toInteger(data[2])) <= 0){ // the third parameter have to be an index
          convo.say('Sorry bro, but you should include the number to complete, like this "todo done 1" (u can see the index using "todo list")')
          return
        }

        // Retrieve the data from collect store
        var channelStore = message.channel
        db.get(channelStore, function(err, todosObj){
          if(err){
            console.log("GET ERROR: " + err)

            // initializes the collect store
            initializeStore(channelStore, false, function(){
              convo.say('Hey mate, could you try again, now there is a place to store your todos!')
            })
          }else if(todosObj){ //
            var index = _.toInteger(data[2])
            if(index > todosObj.open.length){
              convo.say('Hey mate, sorry but this item was not found! Please have a look at "todo list"')
              return
            }

            // Remove based on the index
            todosObj.done.push(todosObj.open[index-1])
            todosObj.open.splice(index-1, 1);

            // Save file
            db.save(channelStore, todosObj, function(err){
              if(err){
                convo.say('Hey mate, could you try again, please? There was an error...')
              }else{
                convo.say('Item done from  your todo list with success')
                changed = true
              }
            });
          }
        })
      })
    }else if(message.text.startsWith("todo clean")){
      bot.startConversation(message,function(err,convo) {

        sendMessageWIPInConv(convo)
        var channelStore = message.channel
        initializeStore(channelStore, false, () => {
          convo.say('The channel store cleaned with success.')
          changed = true
        })
      })
    }else if(message.text.startsWith("todo prioritize")){
      // Create a converstation
      bot.startConversation(message, function(err, convo) {


        // create a path for when a user says YES
        /*convo.addMessage({
                text: 'You said yes! How wonderful.',
        },'yes_thread')*/

        // TODO - Gather the list and send pretty message

        convo.say('This is the current list!')

        convo.ask('What is the new one?', [
            {
                pattern: 'done',
                callback: function(response, convo) {
                    // since no further messages are queued after this,
                    // the conversation will end naturally with status == 'completed'
                    convo.next();
                }
            },
            {
                pattern: regComma,
                callback: function(response, convo) {
                    // since no further messages are queued after this,
                    // the conversation will end naturally with status == 'completed'

                    // TODO - Verify repeting number, not allowed = 2,3,3,4,4
                    // TODO - Verify if any number is out of range = 54,1,2,3

                    convo.say('YEAH Comma')
                    convo.next();
                }
            },
            {
                pattern: regSpace,
                callback: function(response, convo) {
                    // since no further messages are queued after this,
                    // the conversation will end naturally with status == 'completed'
                    convo.say('YEAH Space')
                    convo.next();
                }
            },
            {
                default: true,
                callback: function(response, convo) {
                    convo.repeat();
                    convo.next();
                }
            }
        ]);

        // Handling the end of the conversation
        convo.on('end', function(convo) {
            if (convo.status == 'completed') {
                bot.reply(message, 'Everthing sorted out!')
            } else {
                // this happens if the conversation ended prematurely for some reason
                bot.reply(message, 'OK, if you need me again just call me!')
            }
        });


        convo.activate()
    })
      // Gather the list of todos

      // Set the theards
        // Present the list of todos
        // Ask a question about the new prioritization list and give the options to stop (done)
          // Veririfies the response
            // If correct list 1 2 3 4 55 ... save according
              // Send a message informing
            // If wrong message were sent
              // Explain what they have to send
              // Ask the question again




      // Activate the conversation

    }else if(message.text.startsWith("todo help")){
      bot.reply(message, "TODO help!")
    }

})


// EVENTS HANDLERS
controller.on('channel_created', function(bot, message) {

  initializeStore(message.channel.id, false)

  inviteAllUsersToChannel(message.channel.id)

});

controller.on('channel_deleted', function(bot, message) {
  deleteStore(message.channel)
});


// BOT MESSAGES
controller.hears(['shutdown'], 'direct_message,direct_mention,mention', function(bot, message) {

    bot.startConversation(message, function(err, convo) {

        convo.ask('Are you sure you want me to shutdown?', [
            {
                pattern: bot.utterances.yes,
                callback: function(response, convo) {
                    convo.say('Bye!');
                    convo.next();
                    setTimeout(function() {
                        process.exit();
                    }, 3000);
                }
            },
        {
            pattern: bot.utterances.no,
            default: true,
            callback: function(response, convo) {
                convo.say('*Phew!*');
                convo.next();
            }
        }
        ]);
    });
});


controller.hears(['uptime', 'identify yourself', 'who are you', 'what is your name'],
    'direct_message,direct_mention,mention', function(bot, message) {

        var hostname = os.hostname();
        var uptime = formatUptime(process.uptime());

        bot.reply(message,
            ':robot_face: I am a bot named <@' + bot.identity.name +
             '>. I have been running for ' + uptime + ' on ' + hostname + '.');

    });

function formatUptime(uptime) {
    var unit = 'second';
    if (uptime > 60) {
        uptime = uptime / 60;
        unit = 'minute';
    }
    if (uptime > 60) {
        uptime = uptime / 60;
        unit = 'hour';
    }
    if (uptime != 1) {
        unit = unit + 's';
    }

    uptime = uptime + ' ' + unit;
    return uptime;
}

// FUNCTIONS
var validateRangeOfNumber = value => {
  console.log("VALIDATE " + value)
  console.log(value.split(' '))
  if(regComma.test(value))
    return value.split(',')
  if(regSpace.test(value))
    return value.trim().split(' ')

  return null;
}

var deleteStore = function (storeName, callback){
  // delete by ID
  db.delete(storeName, function(err){
    if(err){
      console.log('Error trying to delete store: ' +storeName)
      console.log(err)
    }else{
      console.log('The store ' + storeName + '.json was deleted with success. ')
      changed = true

      if(callback)
        callback()
    }
  });
}


var initializeStore = function (storeName, collectStore, callback){
  var storage
  if(collectStore){ // Collect Store does not need done array
    storage = {
        "open": []
      }
  }else{
    storage = {
        "open": [],
        "done": []
      }
  }

  // save with custom ID
  db.save(storeName, storage, function(err){
    console.log('The storage ' + storeName + '.json was initialized with success. ')
    changed = true
    if(callback)
      callback()
  });

}

var sendMessageWIPInConv = function(convo){
  convo.say("Working on your request...")
}

var inviteAllUsersToChannel = (channelId) => {
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
          );
        })
    });
  });
}

var backupRoutine = () => {
  console.log("BACKUP ROUTINE TRIGGERED")

  if(!changed) {
    console.log("Nothing changed")
    return
  }

  var date = new Date()
  var dirDest = 'backup/data/' + Date.now()

  console.log("BACKUP TO " + dirDest)
  fs.copy('data/', dirDest, err => {
    if (err) return console.error(err)
    console.log("backup done with success!")
    changed = false // Wait next change to backup again
  });

}

// Backup routine
setInterval(backupRoutine, 1800000); // every 30 min
