import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { Event, ICommand } from '../structures';

export default new Event({
    name: 'messageCreate',
    async execute(client, message) {
        if(!message.guild || message.author?.bot) return;
        
        const mentionRegex = message.content.match(new RegExp(`^<@!?(${client.user.id})>`, 'gi'));
        let guild = await client.db.get(`guild.${message.guild.id}`);
        
        const prefix = mentionRegex ? String(mentionRegex) : guild?.prefix ?? 'z.';
        if(message.content === `<@!${client.user.id}>` || message.content === `<@${client.user.id}>`) return message.reply(` **› Oii ${message.author.displayName}**! Eu sou a **${client.user.displayName}**, um bot feito para ser útil para você e seu servidor, meu prefixo é **\`${guild?.prefix ?? 'z.'}\`** para ver meus comandos utilize o comando **\`${guild?.prefix ?? 'z.'}ajuda\`**!`).then((msg) => setTimeout(() => msg.delete(), 60000 * 2));

        if(message.content.toLowerCase().startsWith(prefix.toLowerCase())) {
            const [cmd, ...args] = message.content.slice(prefix.length).trim().split(/ +/g);
            if(!guild) guild = await client.db.set(`guild.${message.guild.id}`, { prefix: 'z.' });
            if(!cmd.length) return;
            
            let command = client.commands.get(cmd.toLowerCase());
            
            async function executeCommand(command: ICommand) {
                if(command?.ownerOnly && !client.owner.includes(message.author.id)) return;
                return command.execute({ client, message, args });
            }
            
            if(!command) {
                const match = findBestMatch(cmd, client.commands.all);

                if(match.rating > 0.75) {
                    command = client.commands.get(match.target);
                    return executeCommand(command);
                }
            } else {
                return executeCommand(command)
            }
        }
    }
});

function findBestMatch(input: string, array: string[]) {
    let target = null;
    let rating = 0;

    array.forEach((text) => {
        const rate = calculateRating(input, text);
        
        if(rate > rating) {
            rating = rate;
            target = text;
        }
    });

    return { target, rating };
}

function calculateRating(text1: string, text2: string) {
    const matches = text1.match(new RegExp(`(?:${text2.split('').join('|')})`, 'g'));
    const rate = matches ? matches.length / Math.max(text1.length, text2.length) : 0;
    return rate;
}