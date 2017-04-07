// IMPLEMENTATION

// collect add "description of the insight" - DONE
// collect list -> Retrives the ideas       - DONE
// collect remove index                     - DONE
// collect clean                            - DONE
// collect help

// todo add "description of todo" [user] [priority]
// todo list -> list channels todos
// todo list all -> list all channels todos
// todo list done -> list all todos already done
// todo remove|tick|strike index
// todo clean
// todo help

// IMPROVEMENTS
// Create functions to save n other things
// Make the messages beautiful
// Add a conversation beginning with collect

var Botkit = require('botkit')
var request = require('request')
var _ = require('lodash')
var Store = require("jfs");
var db = new Store("data",{pretty:true});

var controller = Botkit.slackbot({debug: true});

// VERIFY ENV VARIABLES
if (!process.env.slacktoken) {
    console.log('Error: Specify token in environment');
    process.exit(1);
}

if (!process.env.slacktokenromulo) {
    console.log('Error: Specify admin token in environment');
    process.exit(1);
}


var bot = controller.spawn({
    token: process.env.slacktoken
}).startRTM();

var collectStore = "collect"

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

        // Retrives the values
        db.get(collectStore, function(err, collectObjs){
          if(err){
              console.log("GET ERROR: " + err)

              // initializes the collect store
              initializeStore(collectStore, function(){
                convo.say('Hey mate, could you try again, now there is a place to store your ideas!')
              })

          }else if(collectObjs){ //
            // Add a new ideia
            collectObjs.open.push(newCollect) // Add new collect to store

            // Save file
            db.save(collectStore, collectObjs, function(err){
              if(err){
                convo.say('Hey mate, could you try again there was an error?')
              }else(
                convo.say('Collected with success! New ideia: ' + newCollect.description)
              )
            });

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
            initializeStore(collectStore, function(){
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
              _.forEach(collectObjs.open, function(todo) {
                response += index +'. '+ todo.description + '\n'
                index++;
              });
              // FORMAT "text": "*bold* `code` _italic_ ~strike~",
             /*  var formatted = {
                    "text": response
                    "mrkdwn": true
                }*/

              var formatted=   {
                  "attachments": [
                      {
                          "fallback": "Required plain-text summary of the attachment.",
                          "color": "#36a64f",
                          "pretext": "Collect list of brilliant ideas",
                          "title": "Slack API Documentation",
                          "title_link": "https://api.slack.com/",
                          "text": "Optional text that appears within the attachment",
                          "fields": [
                              {
                                  "title": "Priority",
                                  "value": "High",
                                  "short": false
                              }
                          ],
                          "image_url": "http://my-website.com/path/to/image.jpg",
                          "thumb_url": "http://example.com/path/to/thumb.png",
                          "footer": "Slack API",
                          "footer_icon": "https://platform.slack-edge.com/img/default_application_icon.png",
                          "ts": 123456789
                      }
                  ]
              }
              convo.say(formatted)
          }
        })
      });



    }else if(message.text.startsWith("collect remove")){
      bot.startConversation(message,function(err,convo) {

        sendMessageWIPInConv(convo)

        // Validate the data
        var data = message.text.split(' ')
        if(data.length <= 2){
          // Send validation message
          convo.say('Sorry bro, but your message should be like "collect remove 1" (u can see the index using "collect list" message)')
          return
        }else if((_.toInteger(data[2])) <= 0){ // the third parameter have to be an index
          convo.say('Sorry bro, but you should include the number to remove, like this "collect remove 1" (u can see the index using "collect list" message)')
          return
        }

        // Retrieve the data from collect store
        db.get(collectStore, function(err, collectObjs){
          if(err){
            console.log("GET ERROR: " + err)

            // initializes the collect store
            initializeStore(collectStore, function(){
              convo.say('Hey mate, could you try again, now there is a place to store your ideas!')
            })
          }else if(collectObjs){ //
            var index = _.toInteger(data[2])
            if(index > collectObjs.open.length){
              convo.say('Hey mate, sorry but this item was not found! Please have a look at "collect list"')
              return
            }

            // Remove based on the index
            collectObjs.open.splice(index-1, 1);

            // Save file
            db.save(collectStore, collectObjs, function(err){
              if(err){
                convo.say('Hey mate, could you try again, please? There was an error...')
              }else(
                convo.say('Item removed from collect list with success')
              )
            });
          }
        })
      })
    }else if(message.text.startsWith("collect clean")){
      bot.startConversation(message,function(err,convo) {

        sendMessageWIPInConv(convo)

        initializeStore(collectStore, () => {
          convo.say('The collect store cleaned with success.')
        })
      })
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

})


// EVENTS HANDLERS
controller.on('channel_created', function(bot, message) {

  initializeStore(message.channel.id, message.channel.id)

  // TODO - Create a new arrow function to invite all users to a channel
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

controller.on('channel_deleted', function(bot, message) {
  deleteStore(message.channel)
});

var deleteStore = function (storeName, callback){
  // delete by ID
  db.delete(storeName, function(err){
    if(err){
      console.log('Error trying to delete store: ' +storeName)
      console.log(err)
    }else{
      console.log('The store ' + storeName + '.json was deleted with success. ')
      if(callback)
        callback()
    }
  });
}


var initializeStore = function (storeName, callback){
  // TODO - initialize Store according to a type, Collect Store does not need done array
  var todos = {
        "open": [],
        "done": []
      }

  // save with custom ID
  db.save(storeName, todos, function(err){
    console.log('The store ' + storeName + '.json was initialized with success. ')
    if(callback)
      callback()
  });

}

var sendMessageWIPInConv = function(convo){
  convo.say("Working on your request...")
}
