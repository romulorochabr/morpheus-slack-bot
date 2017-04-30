var os      = require('os')
var fs      = require('fs-extra')

var morpheusos =  {
  dataHasChanged : false,
  
  uptime: (bot , message) => {
    var hostname = os.hostname();
    var uptime = morpheusos.formatUpTime(process.uptime());

    bot.reply(message,
        ':robot_face: I am a bot named <@' + bot.identity.name +
         '>. I have been running for ' + uptime + ' on ' + hostname + '.');

  },

  shutdown: (bot , message) => {
    bot.startConversation(message, function(err, convo) {

        convo.ask('Are you sure you want me to shutdown?', [
            {
                pattern: bot.utterances.yes,
                callback: function(response, convo) {
                    convo.say('Bye!')
                    convo.next()
                    setTimeout(function() {
                        process.exit()
                    }, 3000)
                }
            },
        {
            pattern: bot.utterances.no,
            default: true,
            callback: function(response, convo) {
                convo.say('*Phew!*')
                convo.next()
            }
        }
        ])
    })
  },

  startBackupRoutine : () => {
    setInterval(function(){
	  console.log("BAKCUP ROTINE TRIGGERED")
      if(morpheusos.dataHasChanged){
        morpheusos.backup()
        morpheusos.dataHasChanged = false // Stops backing up until next change
      }
    }, 1800000); // every 30 min
  },

  backup : () => {
    console.log("BACKUP ROUTINE TRIGGERED")

    var date = new Date()
    var dirDest = 'backup/data/' + Date.now()

    console.log("BACKUP TO " + dirDest)
    fs.copy('data/', dirDest, err => {
      if (err) return console.error(err)
      console.log("backup done with success!")
    });

  },

  formatUpTime : uptime => {
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
}

module.exports = morpheusos
