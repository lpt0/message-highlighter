import { Client, MessageReaction, User, PartialUser, DiscordAPIError, Message, GuildMemberRoleManager } from "discord.js";
import { readFileSync  } from "fs";
import { EMOJI_ID, AUTHOR_ID } from "./config"

const Bot = new Client();

/**
 * Get the user's display colour - the colour of the highest role they have
 * with colour (so no transparent roles).
 * @param roles The user's roles.
 * @returns The decimal value of the colour, or 0 if the user has no roles
 *          with colour.
 */
function getHighestRoleColour(roles: GuildMemberRoleManager) : number {
  let colour = 0;

  // Sort roles in order of position, highest to lowest
  const idRoles = roles.cache.sort((prevRole, curRole) : number => { 
    return curRole.rawPosition - prevRole.rawPosition; 
  });
  for (const idRole of idRoles) {
    const role = idRole[1];
    if (role.color !== 0) {
      colour = role.color;
      break;
    }
  }

  return colour;
}

/**
 * Generate a screenshot-like picture of a message.
 * @param message The message.
 */
async function generateImage(message: Message) : Promise<void> {
  //TODO: Partial
  const guildMember = message.member;
  if (!message.partial && guildMember !== null) {
    const nickname = guildMember.nickname || message.author.username;
    const content = message.content;
    const roleColour = getHighestRoleColour(guildMember.roles);
    console.log(nickname, content, roleColour);

    
  } else {
    Promise.reject("Not a guild member");
  }
  
}

/**
 * Executes whenever a reaction is added to a CACHED message.
 * @param reaction The reaction object.
 * @param user The user that added the reaction.
 */
async function onReactionAdd(reaction: MessageReaction, user: User | PartialUser) : Promise<void> {
  const isInGuild = reaction.message.guild !== null;
  if (isInGuild && user.id === AUTHOR_ID && reaction.emoji.id === EMOJI_ID) {
    reaction.message.channel.startTyping();
    await (reaction.remove()
      .catch((e: DiscordAPIError) => {
        console.log(`Failed to remove reaction: ${e.message}`);
      })
    );
    await generateImage(reaction.message);
    reaction.message.channel.stopTyping();
  }
}

Bot.on("ready", () => {
  Bot.user?.setActivity({
    url: "https://www.youtube.com/watch?v=YwyS0rRadXw",
    name: "Gen 5 Music do hit different",
    type: "STREAMING"
  });

  console.log(`${Bot.user?.username} is ready.`);
});

Bot.on("messageReactionAdd", onReactionAdd);

Bot.login(readFileSync("authorization").toString());