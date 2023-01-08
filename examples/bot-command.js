import { MessageEmbed } from 'discord.js';

export const getBuilds = async (abbreviation) => {
   const response = await fetch(
      'https://raw.githubusercontent.com/HighlanderCZ/inj2-mobile-hero-builds/main/builds.json'
   );

   if (!response.ok) {
      const message = `An error has occured: ${response.status}`;
      throw new Error(message);
   }

   const data = await response.json();
   const hero = data.heroes.find((hero) => hero.abbreviations.includes(abbreviation));

   if (hero) {
      // Found hero
      const embeds = [];
      const heroEmbed = new MessageEmbed();
      const colors = {
         silver: 'silver',
         gold: 'gold',
         legendary: 'purple',
      };
      const heroColor = colors[hero.rank.toLowerCase()];

      heroEmbed.setTitle(hero.name).setDescription(hero.description);
      heroEmbed.setColor(heroColor);

      heroEmbed.addFields({
         name: 'Rank',
         value: hero.rank,
         inline: true,
         name: 'Class',
         value: hero.class,
         inline: true,
      });

      if (hero.image) {
         hero.setImage(hero.image);
      }

      if (hero.passives.length > 0) {
         hero.passives.forEach((passive) => {
            heroEmbed.addField(passive.name, passive.description);
         });
      }

      embeds.push(heroEmbed);

      hero.build.forEach((build) => {
         const buildEmbed = new MessageEmbed();

         buildEmbed.setTitle(build.name).setDescription(build.description);
         buildEmbed.setColor(heroColor);

         if (build.author) {
            buildEmbed.setAuthor({
               name: build.author,
            });
         }

         buildEmbed.addField('Gear', build.gear);
         buildEmbed.addField('Talents', build.talents);
         buildEmbed.addField('Stats', build.talents);

         embeds.push(buildEmbed);
      });

      // Do something with embeds
   } else {
      // Not found
   }
};

getBuilds().catch((error) => {
   error.message;
});
