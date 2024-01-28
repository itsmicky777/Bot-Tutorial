import { Client as BaseClient, Collection, EmbedBuilder as BaseEmbed, GatewayIntentBits, Message, Options } from 'discord.js';
import { ICommand, loadEvents, loadCommands } from './Handler';
import { QuickDB, JSONDriver } from 'quick.db';
import 'dotenv/config';

export class Client extends BaseClient {
    commands: Collection<string, ICommand>;
    aliases: Collection<string, string>;
    database: QuickDB;
    
    constructor() {
        super({
            makeCache: Options.cacheWithLimits({
                AutoModerationRuleManager: 0,
                ApplicationCommandManager: 0,
                BaseGuildEmojiManager: Infinity,
                DMMessageManager: Infinity,
                GuildEmojiManager: Infinity,
                GuildMemberManager: Infinity,
                GuildBanManager: 0,
                GuildForumThreadManager: 0,
                GuildInviteManager: 0,
                GuildMessageManager: 100,
                GuildScheduledEventManager: 0,
                GuildStickerManager: 0,
                GuildTextThreadManager: 0,
                MessageManager: 100,
                PresenceManager: 0,
                ReactionManager: 0,
                ReactionUserManager: 0,
                StageInstanceManager: 0,
                ThreadManager: 0,
                ThreadMemberManager: 0,
                UserManager: 1000,
                VoiceStateManager: 0
            }),
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent
            ],
            allowedMentions: {
                parse: ['users'],
                repliedUser: false
            },
            failIfNotExists: false,
            presence: { status: 'dnd' },
            shardCount: 2,
        });
        
        this.db = new QuickDB({ driver: new JSONDriver() });
        this.commands = new Collection();
        this.aliases = new Collection();
    }
    
    get emjs() {
        /*
            TROQUE POR SEUS SERVIDORES DE EMOJIS!
            SWITCH TO YOUR EMOJIS SERVERS!
        */
        
        const guilds = ['1196413847448334366'];
        const emojis: Record<string, string> = {};
        
        for(const guildId of guilds) {
            const guild = this.guilds.cache.get(guildId);
            
            guild?.emojis?.cache?.forEach((emoji) => {
                emojis[emoji.name] = `<${emoji.animated ? 'a' : ''}:${emoji.name}:${emoji.id}>`;
            });
        }
        
        return emojis;
    }
    
    get owner() {
        /*
            TROQUE PELO SEU ID DO DISCORD!
            CHANGE IT WITH YOUR DISCORD ID!
        */
        
        return ['1192255645689327637', '1193556168438710353'] as string[];
    }
    
    async start() {
        /*
            ADICIONE SEU TOKEN NA ENV, USE O ARQUIVO EXEMPLO .env-example
            ADD YOUR TOKEN IN THE ENV, USE THE EXAMPLE .env-example FILE
        */
        
        await super.login(process.env.TOKEN);
        
        this.once('ready', async() => {
            console.log(`› Cliente iniciado na aplicação ${this.user.displayName}`);
            
            await loadCommands(this);
            await loadEvents(this);  
        });
        
        return this;
    }
}

export class EmbedBuilder extends Embed {
    constructor(message?: Message, thumbnail = false) {
        super({});
        
        this.setColor('#7241BC');
        const date = new Date(Date.now()).format;
        if (thumbnail) this.setThumbnail(message.author.displayAvatarURL());
        if (message) this.setFooter({ text: `› ${message.author.displayName} - ${date}`, iconURL: message.author.displayAvatarURL() });
    }
}