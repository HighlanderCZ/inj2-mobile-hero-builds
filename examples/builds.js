import { MessageEmbed } from 'discord.js';
import fetch from 'node-fetch';

export const getBuild = async (abbreviation) => {
   const endpoint =
      'https://raw.githubusercontent.com/HighlanderCZ/inj2-mobile-hero-builds/374cbd3fef258bdaf4e11debf7362411918f3242/builds.json';
   const response = await fetch(endpoint);

   if (!response.ok) {
      throw new Error(`An error has occured while fetching data: ${response.status}`);
   }

   const data = await response.json();
   const hero = data.heroes.find((hero) => hero.abbreviations.includes(abbreviation));

   if (hero) {
      const embeds = [];
      const heroEmbed = new MessageEmbed();
      const colors = {
         silver: 0xd0e0e3,
         gold: 0xffd34d,
         legendary: 0xbf48ac,
      };
      const heroColor = colors[hero.rank.toLowerCase()];

      heroEmbed.setTitle(hero.name).setDescription(hero.description);
      heroEmbed.setColor(heroColor);

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
         const buildEmbed = new MessageEmbed();

         buildEmbed.setTitle(build.name).setDescription(build.description);
         buildEmbed.setColor(heroColor);

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

         buildEmbed.addField('Gear', build.gear);
         buildEmbed.addField('Talents', build.talents);
         buildEmbed.addField('Stats', build.talents);

         embeds.push(buildEmbed);
      });

      return embeds;
   } else {
      throw new Error(`No builds exists for '${abbreviation}'.`);
   }
};
