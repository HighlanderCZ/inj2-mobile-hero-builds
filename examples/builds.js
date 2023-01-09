import { MessageEmbed } from 'discord.js';
import fetch from 'node-fetch';

let cachedResponse;

const createEmbeds = (hero) => {
   const embeds = [];
   const heroEmbed = new MessageEmbed();
   const colors = {
      silver: 0xd0e0e3,
      gold: 0xffd34d,
      legendary: 0xbf48ac,
      undetermined: 0x98c379,
   };
   const heroColor = colors.hasOwnProperty(hero.rank.toLowerCase())
      ? colors[hero.rank.toLowerCase()]
      : colors.undetermined;

   heroEmbed.setTitle(hero.name);
   heroEmbed.setColor(heroColor);

   if (hero.description && hero.description.length > 0) {
      heroEmbed.setDescription(hero.description);
   }

   heroEmbed.addFields(
      {
         name: 'Rank',
         value: hero.rank,
         inline: true,
      },
      {
         name: 'Class',
         value: hero.class,
         inline: true,
      }
   );

   if (hero.image) {
      heroEmbed.setImage(hero.image);
   }

   if (hero.passives.length > 0) {
      hero.passives.forEach((passive) => {
         heroEmbed.addField(passive.name, passive.description);
      });
   }

   embeds.push(heroEmbed);

   hero.builds.forEach((build) => {
      const buildEmbed = new MessageEmbed();

      buildEmbed.setTitle(build.name);
      buildEmbed.setColor(heroColor);

      if (build.description && build.description.length > 0) {
         buildEmbed.setDescription(build.description);
      }

      if (build.author) {
         buildEmbed.setAuthor({
            name: `Courtesy of ${build.author}`,
         });
      }

      buildEmbed.addField('Gear', build.gear);
      buildEmbed.addField('Talents', build.talents);

      const buildStats = build.stats;
      const stats = [
         `Attack: ${buildStats.attack}`,
         `Health: ${buildStats.health}`,
         `Defense: ${buildStats.defense}`,
         `Blocking: ${buildStats.blocking}`,
         `CAD: ${buildStats.cad}`,
         `CAC: ${buildStats.cac}`,
         `LAC: ${buildStats.lac}`,
         `FAC: ${buildStats.fac}`,
         `Stun resistance: ${buildStats.stun_resistance}`,
         `DoT resistance: ${buildStats.dot_resistance}`,
         `Crit resistance: ${buildStats.crit_resistance}`,
      ];

      buildEmbed.addField('Stats', stats.join('\n'));
      embeds.push(buildEmbed);
   });

   return embeds;
};

export const getBuild = async (abbreviation) => {
   let data;

   if (!cachedResponse) {
      // Nothing in cache, let's fetch the data
      const endpoint = 'https://raw.githubusercontent.com/HighlanderCZ/inj2-mobile-hero-builds/main/builds.json';
      const response = await fetch(endpoint);

      if (!response.ok) {
         throw new Error(`An error has occured: ${response.status}`);
      }

      data = await response.json();
      cachedResponse = data;
   } else {
      // Data had already been fetched before, use the saved response
      data = cachedResponse;
   }

   const hero = data.heroes.find((hero) => hero.abbreviations.includes(abbreviation));

   if (hero) {
      return createEmbeds(hero);
   } else {
      throw new Error(`No builds exist for '${abbreviation}'.`);
   }
};
