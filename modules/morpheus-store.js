var morpheusStore =  {
  deleteStore : function (db, storeName, callback){
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
    })
  },

  initializeStore : function (db, storeName, collectStore, callback){
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
    })
  }

}

module.exports = morpheusStore
