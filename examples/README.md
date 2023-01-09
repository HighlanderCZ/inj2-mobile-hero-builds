# Injustice 2 Mobile - Hero builds

## EXAMPLES

`builds.js` contains a working implementation for Discord.js:

```javascript
import { Client } from 'discord.js';
import { getBuild } from './builds.js';

// Connect to the client and all that jazz

// Listen for incoming messages
client.on('messageCreate', (message) => {
   // Only execute if the message is from a real user and starts with the command we want to watch for
   if (message.content.startsWith('!build') && !message.author.bot) {
      // Check if the message follows the desired format: '!build name'
      const regex = /!build\s{1}(\w+)/;
      const match = message.content.match(regex);

      if (match) {
         // If it matches, call the getBuild function with the abbreviation as its lone argument
         // We use match[1] because of how .match() works; match[0] is the entire messsage
         getBuild(match[1].toLowerCase())
            .then((result) => {
               // If successful, getBuild returns an array of MessageEmbed objects
               message.channel.send({ embeds: result });
            })
            .catch((error) => {
               // If unsuccessful, an Error object is returned
               // This could be for any number of reasons: network error while
               // fetching build data, there isn't a build for this abbreviation
               // yet, etc.
               message.channel.send(`Unable to get build: ${error.message}`);
            });
      } else {
         // We don't have a match, give the user a hint on how to use the command
         message.channel.send(`Command isn't in the required format; try '**!build jsgl**'`);
      }
   }
});
```
