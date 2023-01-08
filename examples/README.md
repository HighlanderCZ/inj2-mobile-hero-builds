# Injustice 2 Mobile - Hero builds

## EXAMPLES

`builds.js` contains a working implementation for Discord.js:

```javascript
import { Client } from 'discord.js';
import { getBuild } from './builds.js';

// Connect to the client and all that jazz

// Listen for incoming messages
client.on('messageCreate', (message) => {
   if (message.author.bot) return;

   if (message.content.startsWith('!build')) {
      // Check if the message follows the desired format: '!build name'
      const regex = /!build\s{1}(w+)/;
      const match = message.content.match(regex);

      if (match) {
         // If it matches, call the getBuild function with the abbreviation
         getBuild(match[1])
            .then((result) => {
               // If successful, returns an array of MessageEmbed objects
               message.channel.send({ embeds: result });
            })
            .catch((error) => {
               // If unsuccessful, returns an Error object
               // This could be for any number of reasons: network error while
               // fetching build data, there isn't a build for this abbreviation
               // yet, etc.
               message.channel.send(`Unable to get build: ${error.message}`);
            });
      }
   }
});
```
