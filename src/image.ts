/**
 * @file image.ts
 * @description Image generation functions
 * @author Haran <haran@nxdomain.ca>
 */
import { createCanvas, loadImage } from "canvas";
import { Message } from "discord.js";

/**
 * The height of a single message, in pixels (1920x1080, default zoom)
 */
//const SINGLE_MESSAGE_HEIGHT = 48;

//const MARGIN_HEIGHT = 4;
//const MARGIN_WIDTH = 40;
const FONT = "Whitney";

/**
 * The required message data.
 */
interface MessageData {
  name: string,
  content: string,
  avatar: string,
  colour: string
}

/**
 * Get the message data needed to generate an image.
 * @param message The discord.js message.
 */
function getMessageData(message: Message) : MessageData {
    const guildMember = message.member;
    return {
      name: guildMember?.displayName || message.author.username,
      content: message.content,
      avatar: (message.author.avatarURL({ format: "png", size: 64 }) 
              || message.author.defaultAvatarURL),
      colour: guildMember?.displayHexColor ?? "#ffffff"
    };
}

/**
 * Generate a screenshot-like picture of a message.
 * @param message The message.
 */
export async function GenerateImageFromMessage(message: Message) : Promise<Buffer> {
  let buffer: Buffer;
  if (!message.partial && message.member !== null) {
    const messageData = getMessageData(message)
    const avatarImage = await loadImage(messageData.avatar); //await loadImage(Buffer.from(avatarData));
    const canvas = createCanvas(400, 48);
    const ctx = canvas.getContext("2d");

    // Draw background
    ctx.fillStyle = "#36393f";
    ctx.fillRect(0, 0, 400, 48);

    
    // Save original context
    ctx.save();
    // Specify clipping area
    ctx.beginPath();
    ctx.arc(48 / 2, 48 / 2, 18, 0, 2 * Math.PI);
    // Clip content to be within this circle
    ctx.clip(); 
    // Draw avatar
    ctx.drawImage(avatarImage, 0, 0, 48, 48);
    // Restore saved context
    ctx.restore();

    // Author text
    ctx.fillStyle = messageData.colour;
    ctx.font = `500 0.75rem ${FONT}`;
    ctx.fillText(messageData.name, 48 + 4, 17);

    // Content
    ctx.fillStyle = "#dcddd4"
    ctx.font = `650 15px ${FONT}`;
    ctx.fillText(messageData.content, 48 + 4, 17 + 15 + 8);
    
    buffer = canvas.toBuffer("image/png");
  } else {
    Promise.reject("Not a guild message");
  }
  return new Promise<Buffer>(resolve => resolve(buffer));
}