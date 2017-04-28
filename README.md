========================== WIP =========================
# morpheus-slack-bot
Morpheus Bot helps u to find the path, but only you can walk the path

********* RELEASE 0.3 **********

IMPROVEMENTS
// Prevent non users to deal with the channel

// Start conversation
  // collect
  // todo
    // Say how to talk to him
      //  send entire command or parcially by means questions
    // what is the channel
    // what is the todo
    // Who is going to do it?

// Code using conversations starting with collect and todo direct messages to morpheus
      Start a conversation and boot show the channels and from that do the commands
      Design the conversation between morpheus and the person
        collect -> Start a conversation
        todo -> Ask firtly for the channels
        both could start a conversation if some part of the command is lacking


========================== FUTURE ========================
********* RELEASE 0.4 **********

IMPROVEMENTS
  Implementation of Collect help
  Implementation of Todo help
  Code using Promises

========================== DONE =========================
********* RELEASE 0.1 **********

// COLLECT
// collect add "description of the insight" - DONE
// collect list -> Retrives the ideas       - DONE
// collect remove index                     - DONE
// collect clean                            - DONE
// collect help

// TODOs
// todo add "description of todo" [user] [priority]     - DONE
// todo list -> list channels todos                     - DONE
// todo list all -> list all todos (open and done)      - DONE
// todo list done -> list all todos already DONE        - DONE
// todo list @user|word -> filter by user or word       - DONE
// todo done index                                      - DONE
// todo strike index                                    - DONE
// todo unstrike index                                  - DONE
// todo remove index                                    - DONE
// todo clean                                           - DONE
// todo help

######## LIST OF IMPROVEMENTS - BACKLOG #####
// GENERAL
// Create shortcuts for the commands (todo -ld, todo -a)
// Initialize Store only when error is file not found.
// Create confirmations to remove, done and clean
// Use Promises (Begin with getStore())

// IMPROVEMENTS
// Review the messages to create more friendly msgs
    // Make the messages beautiful
      // List - DONE
      // Others
// Create conversations starting with collect n todo
// Verify what can be a function
// Think of collect move to #channel 1
// Organize by priority
// Assign to - assign 1 to @user
// Unassign - unassign 1
// collect move to #channel index ??? // NOT SURE

********* RELEASE 0.2 **********
// NEW FEATURES
// Code in Modules (collect and todo)                        - DONE

BOT
// Listening messages
  Morpheus hearing the messages
    Collect COMMANDS                                         
      List                                                  - DONE
      Add                                                   - DONE     
      Remove                                                - DONE
      Clean                                                 - DONE      
    Todo COMMANDS                                           - DONE
        todoList                                            - DONE    
        todoListAll                                         - DONE
        todoListDone                                        - DONE    
        todoAdd                                             - DONE
        todoRemove                                          - DONE
        todoClean                                           - DONE  
        todoStrike                                          - DONE
        todoUnstrike                                        - DONE
        todoDone                                            - DONE
        todoPrioritize                                      - DONE
        todoHelp                                            - DONE
    Validation to identify channel                          - DONE
  Migrate Shutdown to morpheus-os                           - DONE
  Migrate Back to morpheus-os                               - DONE
  Create modules                                            - DONE


COLLECT
// Remove list of items - collect remove 1,2,3,4 or 1 2 3 4 - DONE

// TODOs
// Remove list of items - todo remove 1,2,3,4 or 1 2 3 4    - DONE
// Done list of items - todo remove 1,2,3,4 or 1 2 3 4      - DONE
// Strike list of items - todo remove 1,2,3,4 or 1 2 3 4    - DONE
// Unstrike list of items - todo remove 1,2,3,4 or 1 2 3 4  - DONE
// todo prioritize 1,2,3,4,5                                - DONE

IMPROVEMENTS
// Module for OS                                            - DONE
// Use constants for the commands                           - DONE
