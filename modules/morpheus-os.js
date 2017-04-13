var os      = require('os')
var fs      = require('fs-extra')

var morpheusos =  {
  uptime: (bot , message) => {
    var hostname = os.hostname();
    var uptime = morpheusos.formatUpTime(process.uptime());

    bot.reply(message,
        ':robot_face: I am a bot named <@' + bot.identity.name +
         '>. I have been running for ' + uptime + ' on ' + hostname + '.');

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
  },

  backupRoutine : () => {
    console.log("BACKUP ROUTINE TRIGGERED")

    var date = new Date()
    var dirDest = 'backup/data/' + Date.now()

    console.log("BACKUP TO " + dirDest)
    fs.copy('data/', dirDest, err => {
      if (err) return console.error(err)
      console.log("backup done with success!")
    });

  }
}

module.exports = morpheusos
