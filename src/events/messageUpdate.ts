import { Message } from 'discord.js';
import { Event } from '../structures';

export default new Event({
    name: 'messageUpdate',
    async execute(client, old, message) {
        if(!message.guild || message.author.bot) return;
        if(message instanceof Message && message?.content.trim() !== old?.content.trim()) return client.emit('messageCreate', message);
    }
});