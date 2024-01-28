import { Awaitable, ClientEvents, Message } from 'discord.js';
import { Client } from './Client';
import { glob } from 'glob';

export interface Execute {
    message: Message;
    client: Client;
    args: string[];
}

export interface ICommand {
    name: string;
    aliases?: string[];
    ownerOnly?: boolean;
    execute: (options: Execute) => Awaitable<any>;
}

export class Command {
    constructor(command: ICommand) {
        Object.assign(this, command);
    }
    
    toJSON() {
        return { ...this };
    }
}

export class Event<Key extends keyof ClientEvents = keyof ClientEvents> {
    name: Key;
    execute: (client: Client, ...args: ClientEvents[Key]) => Awaitable<any>;

    constructor({ name, execute }: { name: Key, execute: (client: Client, ...args: ClientEvents[Key]) => Awaitable<any>}) {
        this.name = name;
        this.execute = execute;
    }
}

export async function loadCommands(client: Client) {
    const files = await glob('dist/commands/**/*.js');
    
    for (const file of files) {
        const command = ((await import(`${process.cwd()}/${file}`)).default) as ICommand;
    
        if (command.name) {
            client.commands.set(command.name, command);
            command?.aliases?.forEach((alias) => client.aliases.set(alias, command.name));
        }
    }
    
    console.log(`Comandos [${client.commands.size}]: ${client.commands.map((command) => command.name).join(', ')}`);
}

export async function loadEvents(client: Client) {
    const files = await glob('dist/events/*.js');
        
    for(const file of files) {
        const event = ((await import(process.cwd() + '/' + file))?.default) as IEvent;
        client.on(event.name, event.execute.bind(null, client));
    }
}