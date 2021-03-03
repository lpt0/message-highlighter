/**
 * @file main.ts
 * @description Discord bot for generation images on messages.
 * @author Haran <haran@nxdomain.ca>
 */
import { Client, MessageReaction, User, PartialUser, DiscordAPIError, TextChannel } from "discord.js";
import { readFileSync  } from "fs";
import { EMOJI_ID, AUTHOR_ID, CHANNEL_ID } from "./config"
import { GenerateImageFromMessage } from "./image"

const Bot = new Client();

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
    const chan = Bot.channels.resolve(CHANNEL_ID) as TextChannel;
    chan.send(
      reaction.message.url,
      {
        files: [ await GenerateImageFromMessage(reaction.message) ]
      }
    )
    reaction.message.channel.stopTyping();
  }
}

Bot.on("messageReactionAdd", onReactionAdd);
Bot.on("ready", () => {
  console.log(`${Bot.user?.username} is ready.`);
});


Bot.login(readFileSync("authorization").toString());