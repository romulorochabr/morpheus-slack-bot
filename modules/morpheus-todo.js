var morStore = require('./morpheus-store.js')
var morCommon = require('./morpheus-common.js')
var _       = require('lodash')

var morpheusTodo =  {

  todoList: (bot, message, db) => {
    bot.startConversation(message,function(err,convo) {

      morCommon.sendMessageWIPInConv(convo)

      // Retrieve the data from collect store
      var channel = morCommon.extractChannel(message.text)

      // Confirm if the channel is not null or empty
      if(_.isEmpty(channel)){
        convo.say('Hey mate, you should tell the channel! Like todo list #channel.')
        return
      }

      // Verifies if the channel is a valid channel
      var validChannel = morCommon.isChannelValid(channel)
      if(!validChannel){
        convo.say('Hey mate, you should tell the channel! Like todo list #channel.')
        return
      }
      db.get(channel, function(err, todosObj){
        if(err){
          console.log("GET STORE ERROR : " + err)

          // initializes the collect store
          morStore.initializeStore(db, channel, false, function(){
            convo.say('Hey mate, could you try again, now there is a place to store your todos!')
          })
        }else if(todosObj){
            // Send message
            var response = ''
            var index = 1
            //Verifies if there is any parameters to filter by
            var filter = ''
            if(message.text.length > 10){ // There are addional parameters
              filter = message.text.substring(10, message.text.indexOf("#")-1)
              filter = filter.trim()
            }

            // Creates the list of items
            _.forEach(todosObj.open, function(todo) {
              if(filter.length > 0){
                if(_.includes(todo.description, filter))
                  response += '`' + index + '` ' + todo.description + '\n'
              }else{
                response += '`' + index + '` ' + todo.description + '\n'
              }
              index++
            })

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
    })
  },

  todoListDone : (bot, message, db) => {
    bot.startConversation(message,function(err,convo) {

      morCommon.sendMessageWIPInConv(convo)

      // Retrieve the data from collect store
      var channel = morCommon.extractChannel(message.text)
      console.log("Channel: " + channel)

      // Verifies if the channel is a valid channel
      // TODO - Create a function to share with all methods
      var validChannel = morCommon.isChannelValid(channel)
      if(!validChannel){
        convo.say('Hey mate, you should tell the channel! Like todo list done #channel.')
        return
      }

      db.get(channel, function(err, todosObj){
        if(err){
          console.log("GET ERROR: " + err)

          // initializes the collect store
          morStore.initializeStore(db, channel, false, function(){
            convo.say('Hey mate, could you try again, now there is a place to store your todos!')
          })
        }else if(todosObj){
            // Send message
            var response = ""
            var index = 1

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
    })
  },

  todoListAll : (bot, message, db) => {
    bot.startConversation(message,function(err,convo) {

      morCommon.sendMessageWIPInConv(convo)

      // Retrieve the data from collect store
      var channel = morCommon.extractChannel(message.text)
      console.log("Channel: " + channel)

      // Verifies if the channel is a valid channel
      // TODO - Create a function to share with all methods
      var validChannel = morCommon.isChannelValid(channel)
      if(!validChannel){
        convo.say('Hey mate, you should tell the channel! Like todo list all #channel.')
        return
      }

      db.get(channel, function(err, todosObj){
        if(err){
          console.log("GET ERROR: " + err)

          // initializes the collect store
          morStore.initializeStore(db, channel, false, function(){
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
            var indexOpen = 1
            var indexDone = 1

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
    })
  },

  todoAdd : (bot , message, db) => {
    bot.startConversation(message,function(err,convo) {

      morCommon.sendMessageWIPInConv(convo)

      // Retrieve the data from collect store
      var channel = morCommon.extractChannel(message.text)
      console.log("Channel: " + channel)

      // Verifies if the channel is a valid channel
      // TODO - Create a function to share with all methods
      var validChannel = morCommon.isChannelValid(channel)
      if(!validChannel){
        convo.say('Sorry bro, but your message should be like todo add "description of your todo" [@user] #channel')
        return
      }

      // Validates the message
      var data = message.text.split(' ')
      if(message.text.length <= (morCommon.COMMANDS.todoAdd+1)){ // >= "todo add " = 9 characters
        // Send validation message
        convo.say('Sorry bro, but your message should be like todo add "description of your todo" [@user] #channel')
        return
      }

      // Clean command string
      console.log("COMMAND: " + message.text)
      var description       = message.text.substring(0, message.text.indexOf("#")-1)
      var description   = description.substring((morCommon.COMMANDS.todoAdd.length+1), description.length)

      // Creates new obj
      var newCollect = {
        "description": description.trim()
      }
      console.log("New item: " + newCollect.description)

      // Retrives the values
      db.get(channel, function(err, todosObj){
        if(err){
            console.log("GET ERROR: " + err)

            // initializes the collect store
            morStore.initializeStore(db, channel, false, function(){
              convo.say('Hey mate, could you try again, now there is a place to store your todos!')
            })

        }else if(todosObj){ //
          // Add a new ideia
          todosObj.open.push(newCollect) // Add new collect to store

          // Save file
          db.save(channel, todosObj, function(err){
            if(err){
              convo.say('Hey mate, could you try again there was an error?')
            }else{
              convo.say('TODO added with success! New todo: ' + newCollect.description)
              changed = true
            }
          })

        }
      })
    })
  },

  todoClean : (bot , message, db) => {
    bot.startConversation(message,function(err,convo) {

      morCommon.sendMessageWIPInConv(convo)

      // Retrieve the data from collect store
      var channel = morCommon.extractChannel(message.text)
      console.log("Channel: " + channel)

      // Verifies if the channel is a valid channel
      // TODO - Create a function to share with all methods
      var validChannel = morCommon.isChannelValid(channel)
      if(!validChannel){
        convo.say('Sorry bro, but your message should be like todo clean #channel')
        return
      }

      morStore.initializeStore(db, channel, false, () => {
        convo.say('The channel store cleaned with success.')
        changed = true
      })
    })
  },

  todoRemove : (bot , message, db) => {
    bot.startConversation(message,function(err,convo) {

      morCommon.sendMessageWIPInConv(convo)
      // Retrieve the data from collect store
      var channel = morCommon.extractChannel(message.text)
      console.log("Channel: " + channel)

      // Verifies if the channel is a valid channel
      // TODO - Create a function to share with all methods
      var validChannel = morCommon.isChannelValid(channel)
      if(!validChannel){
        convo.say('Sorry bro, but your message should be like todo remove 1 #channel')
        return
      }

      // Validate the data
      if(message.text.length <= (morCommon.COMMANDS.todoRemove.length+1)){
        // Send validation message
        convo.say('Sorry bro, but you should include the number to remove, like this "todo remove 1 #channel" (u can see the index using "todo list #channel")')
        return

      }

      var data = message.text.substring((morCommon.COMMANDS.todoRemove.length+1), message.text.length) // Get the data after the command, eliminates the space
      data     = data.substring(0, data.indexOf("#")-1) // Remove the channel

      var indexes = morCommon.validateRangeOfNumber(data.trim())
      if(indexes == null){ // the third parameter have to be an index
        console.log("Indexes null")
        convo.say('Sorry bro, but you should include the number to remove, like this "todo remove 1" (u can see the index using "todo list")')
        return
      }

      // Retrieve the data from collect store
      db.get(channel, function(err, todosObj){
        if(err){
          console.log("GET ERROR: " + err)

          // initializes the collect store
          morStore.initializeStore(db, channel, false, function(){
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
            console.log("Excluding " + index)
            if(index > 0 && index <= todosObj.open.length){
              console.log('Excluding index: ' + index)
              todosObj.open.splice(index-1, 1)
            }
          })

          // Save file
          db.save(channel, todosObj, function(err){
            if(err){
              convo.say('Hey mate, could you try again, please? There was an error...')
            }else{
              convo.say('Item removed from todo list with success')
              changed = true
            }
          })
        }
      })
    })
  },

  todoDone : (bot , message, db) => {
    bot.startConversation(message,function(err,convo) {

      morCommon.sendMessageWIPInConv(convo)
      // Validate the data

      // Retrieve the data from collect store
      var channel = morCommon.extractChannel(message.text)
      console.log("Channel: " + channel)

      // Verifies if the channel is a valid channel
      // TODO - Create a function to share with all methods
      var validChannel = morCommon.isChannelValid(channel)
      if(!validChannel){
        convo.say('Sorry bro, but your message should be like todo done 1 #channel')
        return
      }

      if(message.text.length <= (morCommon.COMMANDS.todoDone.length+1)){
        // Send validation message
        convo.say('Sorry bro, but your message should be like "todo done 1 #channel" (u can see the index using "todo list")')
        return
      }

      var data = message.text.substring((morCommon.COMMANDS.todoDone.length+1), message.text.length) // Get the data after the command, eliminates the space
      data     = data.substring(0, data.indexOf("#")-1) // Remove the channel
      console.log("DATA: " + data)

      var indexes = morCommon.validateRangeOfNumber(data.trim())
      if(indexes == null){ // the third parameter have to be an index
        console.log("Indexes null")
        // TODO - Think of having the messages somewhere to reuse them
        convo.say('Sorry bro, but your message should be like "todo done 1 #channel" (u can see the index using "todo list")')
        return
      }

      // Retrieve the data from collect store
      db.get(channel, function(err, todosObj){
        if(err){
          console.log("GET ERROR: " + err)

          // morStore.initializes the collect store
          morStore.initializeStore(db, channel, false, function(){
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
            console.log("Doneing " + index)
            if(index > 0 && index <= todosObj.open.length){
              console.log('Doneing index: ' + index)
              todosObj.done.push(todosObj.open[index-1])
              todosObj.open.splice(index-1, 1)
            }
          })

          // Save file
          db.save(channel, todosObj, function(err){
            if(err){
              convo.say('Hey mate, could you try again, please? There was an error...')
            }else{
              convo.say('Item done from todo list with success')
              changed = true
            }
          })
        }
      })
    })
  },

  todoStrike : (bot , message, db) => {
    bot.startConversation(message,function(err,convo) {

      morCommon.sendMessageWIPInConv(convo)
      // Retrieve the data from collect store
      var channel = morCommon.extractChannel(message.text)
      console.log("Channel: " + channel)

      // Verifies if the channel is a valid channel
      // TODO - Create a function to share with all methods
      var validChannel = morCommon.isChannelValid(channel)
      if(!validChannel){
        convo.say('Sorry bro, but your message should be like todo strike 1 #channel')
        return
      }

      // Validate the data
      if(message.text.length <= (morCommon.COMMANDS.todoStrike.length+1)){
        // Send validation message
        convo.say('Sorry bro, but your message should be like "todo strike 1 #channel" (u can see the index using "todo list")')
        return
      }

      var data = message.text.substring((morCommon.COMMANDS.todoStrike.length+1), message.text.length) // Get the data after the command, eliminates the space
      data     = data.substring(0, data.indexOf("#")-1) // Remove the channel
      console.log("DATA: " + data)

      console.log("DATA: " + data)
      var indexes = morCommon.validateRangeOfNumber(data.trim())
      if(indexes == null){ // the third parameter have to be an index
        console.log("Indexes null")
        convo.say('Sorry bro, but your message should be like "todo strike 1 #channel" (u can see the index using "todo list")')
        return
      }

      // Retrieve the data from collect store
      db.get(channel, function(err, todosObj){
        if(err){
          console.log("GET ERROR: " + err)

          // morStore.initializes the collect store
          morStore.initializeStore(db, channel, false, function(){
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
            console.log("Striking " + index)
            if(index > 0 && index <= todosObj.open.length){
              console.log('Striking index: ' + index)
              var obj = todosObj.open[index -1]
              obj.description = '~' + obj.description + '~'
              todosObj.open[index -1] = obj
            }
          })

          // Save file
          db.save(channel, todosObj, function(err){
            if(err){
              convo.say('Hey mate, could you try again, please? There was an error...')
            }else{
              convo.say('Item strike from todo list with success')
              changed = true
            }
          })
        }
      })
    })
  },

  todoUnstrike : (bot , message, db) => {
    bot.startConversation(message,function(err,convo) {

      morCommon.sendMessageWIPInConv(convo)

      // Retrieve the data from collect store
      var channel = morCommon.extractChannel(message.text)
      console.log("Channel: " + channel)

      // Verifies if the channel is a valid channel
      // TODO - Create a function to share with all methods
      var validChannel = morCommon.isChannelValid(channel)
      if(!validChannel){
        convo.say('Sorry bro, but your message should be like todo unstrike 1 #channel')
        return
      }

      // Validate the data
      if(message.text.length <= (morCommon.COMMANDS.todoUnstrike.length+1)){
        // Send validation message
        convo.say('Sorry bro, but your message should be like "todo unstrike 1 #channel" (u can see the index using "todo list")')
        return
      }

      var data = message.text.substring((morCommon.COMMANDS.todoUnstrike.length+1), message.text.length) // Get the data after the command, eliminates the space
      data     = data.substring(0, data.indexOf("#")-1) // Remove the channel
      console.log("DATA: " + data)

      var indexes = morCommon.validateRangeOfNumber(data.trim())
      if(indexes == null){ // the third parameter have to be an index
        console.log("Indexes null")
        convo.say('Sorry bro, but your message should be like "todo unstrike 1 #channel" (u can see the index using "todo list")')
        return
      }

      // Retrieve the data from collect store
      db.get(channel, function(err, todosObj){
        if(err){
          console.log("GET ERROR: " + err)

          // initializes the collect store
          morStore.initializeStore(db, channel, false, function(){
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
            console.log("Unstriking " + index)
            if(index > 0 && index <= todosObj.open.length){
              console.log('Unstriking index: ' + index)
              var obj = todosObj.open[index -1]
              obj.description = _.replace(obj.description, new RegExp('~', 'g'), '')
              todosObj.open[index -1] = obj
            }
          })

          // Save file
          db.save(channel, todosObj, function(err){
            if(err){
              convo.say('Hey mate, could you try again, please? There was an error...')
            }else{
              convo.say('Item Unstrike from todo list with success')
              changed = true
            }
          })
        }
      })
    })
  },

  todoPrioritize : (bot , message, db) => {
    bot.startConversation(message,function(err,convo) {

      morCommon.sendMessageWIPInConv(convo)

      // Retrieve the data from collect store
      var channel = morCommon.extractChannel(message.text)
      console.log("Channel: " + channel)

      // Verifies if the channel is a valid channel
      // TODO - Create a function to share with all methods
      var validChannel = morCommon.isChannelValid(channel)
      if(!validChannel){
        convo.say('Sorry bro, but your message should be like todo prioritize 1 #channel')
        return
      }

      // Validate the data
      if(message.text.length <= (morCommon.COMMANDS.todoPrioritize.length +1)){
        // Send validation message
        convo.say('Sorry bro, but your message should be like "todo prioritize 5,1,3 #channel " (u can see the index using "todo list")')
        return
      }

      var data = message.text.substring((morCommon.COMMANDS.todoPrioritize.length+1), message.text.length) // Get the data after the command, eliminates the space
      data     = data.substring(0, data.indexOf("#")-1) // Remove the channel
      console.log("DATA: " + data)

      var indexes = morCommon.validateRangeOfNumber(data.trim())
      if(indexes == null){ // the third parameter have to be an index
        console.log("Indexes null")
        convo.say('Sorry bro, but your message should be like "todo prioritize 1 #channel" (u can see the index using "todo list")')
        return
      }

      // Retrieve the data from collect store
      db.get(channel, function(err, todosObj){
        if(err){
          console.log("GET ERROR: " + err)

          // morStore.initializes the collect store
          morStore.initializeStore(db, channel, false, function(){
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
          })

          _.forEach(lastingArrays, function(obj) {
            todosObj.open.push(obj)
          })

          // Save file
          db.save(channel, todosObj, function(err){
            if(err){
              convo.say('Hey mate, could you try again, please? There was an error...')
            }else{
              convo.say('Item prioritized from todo list with success')
              changed = true
            }
          })
        }
      })
    })
  },

  todoHelp : (bot , message, db) => {
    bot.reply(message, "Not implemented yet. Sorry!")
  }
}

module.exports = morpheusTodo
