import { MessageEmbed } from 'discord.js';
import fetch from 'node-fetch';

const buildData = {
   cachedResponse: null,
   lastFetchedTime: null,
   totalHeroCount: 108, // This value needs to be updated as new heroes are released
   cacheTimeout: 60 * 60 * 1000, // One hour
};

const isDataStale = () => {
   if (!(buildData.lastFetchedTime instanceof Date)) return false;

   const now = new Date();

   // Check if last fetch happened more than {buildData.cacheTimeout} ago
   return buildData.lastFetchedTime.valueOf() + buildData.cacheTimeout < now.valueOf();
};

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
      },
      {
         name: 'Team',
         value: hero.team ? hero.team : 'None',
         inline: true,
      }
   );

   if (hero.image && hero.image.length > 0) {
      heroEmbed.setImage(hero.image);
   }

   if (hero.passives.length > 0) {
      heroEmbed.addField('\u200b', '**Passives**');

      hero.passives.forEach((passive) => {
         let description = `*${passive.description}*`;

         if (passive.effects && passive.effects.length > 0) {
            description += `\n \u2003\u2b25 ${passive.effects.join('\n \u2003\u2b25 ')}`;
         }

         heroEmbed.addField(passive.name, description);
      });
   }

   if (hero.footnote && hero.footnote.length > 0) {
      heroEmbed.setFooter({ text: hero.footnote });
   }

   embeds.push(heroEmbed);

   hero.builds.forEach((build) => {
      const buildEmbed = new MessageEmbed();
      let buildName = build.name;

      if (build.gear_level) {
         buildName += ` (G${build.gear_level})`;
      }

      buildEmbed.setTitle(buildName);
      buildEmbed.setColor(heroColor);

      if (build.description && build.description.length > 0) {
         buildEmbed.setDescription(build.description);
      }

      if (build.author && build.author.length > 0) {
         buildEmbed.setAuthor({
            name: `Courtesy of ${build.author}`,
         });
      }

      buildEmbed.addField('Gear', build.gear);
      buildEmbed.addField('Talents', build.talents);

      const buildStats = build.stats;
      const attack = !isNaN(buildStats.attack)
         ? parseInt(buildStats.attack).toLocaleString('en-US')
         : buildStats.attack;
      const health = !isNaN(buildStats.health)
         ? parseInt(buildStats.health).toLocaleString('en-US')
         : buildStats.health;
      const stats = [
         `Attack: ${attack}`,
         `Health: ${health}`,
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

const fetchData = async () => {
   const endpoint = 'https://raw.githubusercontent.com/HighlanderCZ/inj2-mobile-hero-builds/main/builds.json';
   const response = await fetch(endpoint);

   if (!response.ok) {
      throw new Error(`An error has occured while fetching data from ${endpoint}: ${response.status}`);
   }

   const data = await response.json();

   buildData.cachedResponse = data;
   buildData.lastFetchedTime = new Date(); // Save current time for cache invalidation later

   return data;
};

export const getBuild = async (abbreviation) => {
   let data = buildData.cachedResponse;

   if (!data && !isDataStale()) {
      // Nothing in cache, let's fetch the data
      data = await fetchData();
   }

   const hero = data.heroes.find((hero) => hero.abbreviations.includes(abbreviation));

   if (hero) {
      return createEmbeds(hero);
   } else {
      throw new Error(`No builds exist for '${abbreviation}'.`);
   }
};

export const getBuildDatabaseStats = async () => {
   let data = buildData.cachedResponse;

   if (!data && !isDataStale()) {
      data = await fetchData();
   }

   const statsEmbed = new MessageEmbed();

   const sumHeroes = data.heroes.length;
   const sumBuilds = data.heroes.reduce((accumulator, hero) => accumulator + hero.builds.length, 0);
   const sumHeroesMoreThanOneBuild = data.heroes.filter((hero) => hero.builds.length > 1).length;

   statsEmbed.setTitle('Build statistics');
   statsEmbed.setColor(0x4f71ec);
   statsEmbed.setDescription('Current status of builds database:');
   statsEmbed.addFields(
      {
         name: 'Total heroes',
         value: `${sumHeroes}/${buildData.totalHeroCount}`,
         inline: true,
      },
      {
         name: 'Total builds',
         value: sumBuilds.toString(),
         inline: true,
      },
      {
         name: 'Heroes with more than 1 build',
         value: `${sumHeroesMoreThanOneBuild}/${sumHeroes}`,
         inline: true,
      }
   );

   return statsEmbed;
};
