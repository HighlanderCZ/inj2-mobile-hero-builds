import { MessageEmbed } from 'discord.js';
import fetch from 'node-fetch';

export const getBuild = async (abbreviation) => {
   const endpoint =
      'https://raw.githubusercontent.com/HighlanderCZ/inj2-mobile-hero-builds/374cbd3fef258bdaf4e11debf7362411918f3242/builds.json';
   const response = await fetch(endpoint);

   if (!response.ok) {
      // Something went wrong with the network request
      throw new Error(`An error has occured while fetching data: ${response.status}`);
   }

   const data = await response.json();

   // Find the first hero that matches our abbreviation
   const hero = data.heroes.find((hero) => hero.abbreviations.includes(abbreviation));

   if (hero) {
      const embeds = [];
      const colors = {
         silver: 0xd0e0e3,
         gold: 0xffd34d,
         legendary: 0xbf48ac,
         undetermined: 0x98c379,
      };
      const heroColor = colors.hasOwnProperty(hero.rank.toLowerCase())
         ? colors[hero.rank.toLowerCase()]
         : colors.undetermined;

      // First, create an embed with general information on the hero
      const heroEmbed = new MessageEmbed();
      heroEmbed.setTitle(hero.name);
      heroEmbed.setColor(heroColor);

      if (hero.description && hero.description.length > 0) {
         heroEmbed.setDescription(hero.description);
      }

      if (hero.footnote && hero.footnote.length > 0) {
         heroEmbed.setFooter({ text: hero.footnote });
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
         heroEmbed.addField('\u200B', '\u200B');

         hero.passives.forEach((passive) => {
            heroEmbed.addField(passive.name, passive.description);
         });
      }

      embeds.push(heroEmbed);

      hero.builds.forEach((build) => {
         // Each build gets its own embed
         const buildEmbed = new MessageEmbed();

         buildEmbed.setTitle(build.name);
         buildEmbed.setColor(heroColor);

         if (build.description && build.description.length > 0) {
            buildEmbed.setDescription(build.description);
         }

         if (build.author) {
            const author = {
               name: build.author,
            };

            if (build.author_icon && build.author_icon.length > 0) {
               author.iconURL = build.author_icon;
            }

            if (build.author_url && build.author_url.length > 0) {
               author.url = build.author_url;
            }

            buildEmbed.setAuthor(author);
         }

         if (build.footnote && build.footnote.length > 0) {
            buildEmbed.setFooter({ text: build.footnote });
         }

         buildEmbed.addField('Gear', build.gear);
         buildEmbed.addField('Talents', build.talents);

         const stats = [
            `Attack: ${build.stats.attack}`,
            `Health: ${build.stats.health}`,
            `Defense: ${build.stats.defense}`,
            `Blocking: ${build.stats.blocking}`,
            `CAD: ${build.stats.cad}`,
            `CAC: ${build.stats.cac}`,
            `LAC: ${build.stats.lac}`,
            `FAC: ${build.stats.fac}`,
            `Stun resistance: ${build.stats.stun_resistance}`,
            `DoT resistance: ${build.stats.dot_resistance}`,
            `Crit resistance: ${build.stats.crit_resistance}`,
         ];

         buildEmbed.addField('Stats', stats.join('\n'));

         embeds.push(buildEmbed);
      });

      return embeds;
   } else {
      throw new Error(`No builds exists for '${abbreviation}'.`);
   }
};
