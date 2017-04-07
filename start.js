var Botkit = require('botkit')
var request = require('request')
var _ = require('lodash')
var Store = require("jfs");
var db = new Store("data",{pretty:true});

var controller = Botkit.slackbot({debug: true});

var bot = controller.spawn({
    token: process.env.slacktoken
}).startRTM();

var collectStore = "collect"

controller.on('ambient',function(bot,message) {

    // collect add "description of the insight"
    // collect list -> Retrives the ideas
    // collect remove index -> mark as moved to any project/channel
    // collect clean
    // collect help

    // todo add "description of todo" [priority] [user]
    // todo list -> list channels todos
    // todo list all -> list all channels todos
    // todo list done -> list all todos already done
    // todo remove|tick|strike index
    // todo clean
    // todo help

    // IMPROVEMENTS
    // Create promises
    // Create functions to save n other things
    // Make the messages beautiful
    // when delete a channel, deletes the json file

    // COLLECT ACTIONS
    if(message.text.startsWith("collect add")){ // COLLECT ADD

      sendMessageWIP(message)

      // Validates the message
      var data = message.text.split(' ')
      if(message.text.length <= 12){ // >= "collect add " = 12 characters
        // Send validation message
        bot.reply(message,
          {
            text: 'Sorry bro, but your message should be like collect add "description of your todo" [@user] [priority ****]',
            channel: message.channel
          }
        )
        return
      }

      // Creates new obj
      var newCollect = {
        "description": message.text.substring(12, message.text.length)
      }

      // Retrives the values
      db.get(collectStore, function(err, collectObjs){
        if(err){
            console.log("GET ERROR: " + err)

            // initializes the collect store
            initializeStore(collectStore, message.channel, function(){
              bot.reply(message,
                {text: 'Hey mate, could you try again, now there is a place to store your ideas!' ,
                    channel: message.channel}
              );
            })

        }else if(collectObjs){ //
          // Add a new ideia
          collectObjs.open.push(newCollect) // Add new collect to store

          // Save file
          db.save(collectStore, collectObjs, function(err){
            if(err){
              bot.reply(message,
                {text: 'Hey mate, could you try again there was an error?',
                    channel: message.channel}
              )
            }else(
              bot.reply(message,
                {text: 'Collected with success! New ideia: ' + newCollect.description,
                    channel: message.channel}
              )
            )
          });

        }
      })

    }else if(message.text.startsWith("collect list")){
      sendMessageWIP(message)

      // Retrieve the data from collect store
      // Retrives the values
      db.get(collectStore, function(err, collectObjs){
        if(err){
          console.log("GET ERROR: " + err)

          // initializes the collect store
          initializeStore(collectStore, message.channel, function(){
            bot.reply(message,
              {text: 'Hey mate, could you try again, now there is a place to store your ideas!' ,
                  channel: message.channel}
            )
          })
        }else if(collectObjs){ //
            // Send message
            var response = ""
            var index = 1;
            _.forEach(collectObjs.open, function(todo) {
              response += index +'. '+ todo.description + '\n'
              index++;
            });
            bot.reply(message,
              {text: response ,
               channel: message.channel}
            )
        }
      })


    }else if(message.text.startsWith("collect remove")){
      sendMessageWIP(message)
      // Validate the data
      var data = message.text.split(' ')
      console.log(data)
      console.log(_.toInteger(data[2]))
      console.log(_.isNumber(_.toInteger(data[2])))
      if(data.length <= 2){
        // Send validation message
        bot.reply(message,
          {
            text: 'Sorry bro, but your message should be like "collect remove 1" (u can see the index using "collect list" message)',
            channel: message.channel
          }
        )
        return
      }else if((_.toInteger(data[2])) <= 0){ // the third parameter have to be an index
        bot.reply(message,
          {
            text: 'Sorry bro, but you should include the number to remove, like this "collect remove 1" (u can see the index using "collect list" message)',
            channel: message.channel
          }
        )
        return
      }


      // Retrieve the data from collect store
      db.get(collectStore, function(err, collectObjs){
        if(err){
          console.log("GET ERROR: " + err)

          // initializes the collect store
          initializeStore(collectStore, message.channel, function(){
            bot.reply(message,
              {text: 'Hey mate, could you try again, now there is a place to store your ideas!' ,
                  channel: message.channel}
            )
          })
        }else if(collectObjs){ //
          var index = _.toInteger(data[2])
          if(index > collectObjs.open.length){
            bot.reply(message,
              {text: 'Hey mate, sorry but this item was not found! Please have a look at "collect list"' ,
                  channel: message.channel}
            )
            return
          }

          // Remove based on the index
          collectObjs.open.splice(index-1, 1);

          // Save file
          db.save(collectStore, collectObjs, function(err){
            if(err){
              bot.reply(message,
                {text: 'Hey mate, could you try again, please? There was an error...',
                    channel: message.channel}
              )
            }else(
              bot.reply(message,
                {text: "Item removed from collect list with success" ,
                 channel: message.channel}
              )
            )
          });

        }
      })

    }else if(message.text.startsWith("collect clean")){
      bot.reply(message, "Collect cleaned!")
    }else if(message.text.startsWith("collect help")){
      bot.reply(message, "New TODO added!")
    }else if(message.text.startsWith("todo add")){
      bot.reply(message, "New TODO added!")
    }else if(message.text.startsWith("todo list")){
      bot.reply(message, "List of TODOs")
    }else if(message.text.startsWith("todo remove")){
      bot.reply(message, "Remove TODO")
    }else if(message.text.startsWith("todo clean")){
      bot.reply(message, "TODOs cleaned!")
    }else if(message.text.startsWith("todo help")){
      bot.reply(message, "TODO help!")
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
      
      initializeStore(message.channel.id, message.channel.id)

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

var initializeStore = function (storeName, channel, callback){
  var todos = {
        "open": [],
        "done": []
      }

  // save with custom ID
  db.save(storeName, todos, function(err){
    bot.say(
      {text: 'The store ' + storeName + '.json was initialized with success. ',
          channel: channel}
    )
    if(callback)
      callback()
  });

}

var collectAdd = function (storeName, channel, data, callback){
  var todos = {
        "open": [],
        "done": []
      }

  // save with custom ID
  db.save(storeName, todos, function(err){
    bot.say(
      {text: 'The store ' + storeName + '.json was initialized with success. ',
          channel: channel}
    )
    if(callback)
      callback()
  });

}

var sendMessageWIP = function(message){
  bot.reply(message, "Working on your request...")
}
