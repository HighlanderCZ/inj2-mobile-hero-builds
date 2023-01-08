import { MessageEmbed } from 'discord.js';

export const botCommand = async (abbreviation) => {
   const response = await fetch(
      'https://raw.githubusercontent.com/HighlanderCZ/inj2-mobile-hero-builds/main/builds.json'
   );

   const builds = await response.json();
};
