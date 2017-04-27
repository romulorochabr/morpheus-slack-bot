var morStore = require('./morpheus-store.js')
var morCommon = require('./morpheus-common.js')
var _       = require('lodash')

var morpheusColl =  {
  collectList: (bot , message, db) => {

    bot.startConversation(message,function(err,convo) {

      morCommon.sendMessageWIPInConv(convo)

      // Retrieve the data from collect store
      db.get(morCommon.COLLECT_STORE_NAME, function(err, collectObjs){
        if(err){
          console.log("GET ERROR: " + err)

          // initializes the collect store
          morStore.initializeStore(db, morCommon.COLLECT_STORE_NAME, true, function(){
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
    })
  },

  collectAdd : (bot , message, db) => {
    bot.startConversation(message,function(err,convo) {

      morCommon.sendMessageWIPInConv(convo)
      // Validates the message
      if(message.text.length <= (morCommon.COMMANDS.collectAdd.length+1)){ // >= "collect add " = 12 characters
        // Send validation message
        convo.say('Sorry bro, but your message should be like collect add "description of your todo" [@user] [priority ****]')
        return
      }

      // Creates new obj
      var newCollect = {
        "description": message.text.substring(morCommon.COMMANDS.collectAdd.length+1, message.text.length)
      }

      // Retrieves the values
      db.get(morCommon.COLLECT_STORE_NAME, function(err, collectObjs){
        if(err){
            console.log("GET ERROR: " + err)

            // initializes the collect store
            morStore.initializeStore(db, collectStore, true, function(){
              convo.say('Hey mate, could you try again, now there is a place to store your ideas!')
            })

        }else if(collectObjs){ //
          // Add a new ideia
          collectObjs.open.push(newCollect) // Add new collect to store

          // Save file
          db.save(morCommon.COLLECT_STORE_NAME, collectObjs, function(err){
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
  },

  collectRemove : (bot , message, db) => {
    bot.startConversation(message,function(err,convo) {

      morCommon.sendMessageWIPInConv(convo)

      // Validate the data
      if(message.text.length <= (morCommon.COMMANDS.collectRemove.length+1)){ // collect remove
        // Send validation message
        convo.say('Sorry bro, but your message should be like "collect remove 1" (u can see the index using "collect list" message)')
        return
      }

      var data = message.text.substring((morCommon.COMMANDS.collectRemove.length+1), message.text.length) // Get the data after the command, eliminates the space
      var indexes = morCommon.validateRangeOfNumber(data)
      if(indexes == null){ // the third parameter have to be an index
        convo.say('Sorry bro, but you should include the number to remove, like this "collect remove 1" (u can see the index using "collect list" message)')
        return
      }

      // Retrieve the data from collect store
      db.get(morCommon.COLLECT_STORE_NAME, function(err, collectObjs){
        if(err){
          console.log("GET ERROR: " + err)
          // initializes the collect store
          morStore.initializeStore(db, morCommon.COLLECT_STORE_NAME, true, function(){
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
          db.save(morCommon.COLLECT_STORE_NAME, collectObjs, function(err){
            if(err){
              convo.say('Hey mate, could you try again, please? There was an error...')
            }else{
              convo.say('Item(s) removed from collect list with success')
              changed = true
            }
          })
        }
      })
    })
  },

  collectClean : (bot , message, db) => {
    bot.startConversation(message,function(err,convo) {

      morCommon.sendMessageWIPInConv(convo)

      morStore.initializeStore(db, morCommon.COLLECT_STORE_NAME, true, () => {
        convo.say('The collect store cleaned with success.')
      })
    })
  },

  collectHelp : (bot , message) => {
    bot.reply(message, "Not implemented yet. Sorry!")
  }

}

module.exports = morpheusColl
