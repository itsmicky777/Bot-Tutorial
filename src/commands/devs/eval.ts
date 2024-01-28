import { ActionRowBuilder, ButtonBuilder, ButtonStyle, codeBlock } from 'discord.js';
import { Command, EmbedBuilder } from '../../structures';
import { inspect } from 'node:util';

export default new Command({
    name: 'eval',
    aliases: ['e', 'ev'],
    ownerOnly: true,
    async execute({ message, client, args }) {
        let code: string;

        const embed = new EmbedBuilder(message);

        try {
            code = inspect(await eval(args.join(' ')), { depth: 0 });
        } catch (err) {
            if (err instanceof Error) code = err.stack;
        }

        embed.setDescription(`>>> ${codeBlock('js', code.slice(0, 3000).replaceAll(client.token, 'TOKEN'))}`);

        const button = new ButtonBuilder()
            .setStyle(ButtonStyle.Danger)
            .setCustomId('eval_delete')
            .setEmoji('🗑️');

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents([button]);

        await message.reply({
            embeds: [embed],
            components: [row]
        });

        const collector = message.createMessageComponentCollector({
            filter: (interaction) => interaction.user.id !== message.author.id ? (interaction.deferUpdate() ? false : false) : true,
            time: 60000 * 5,
        });

        collector.on('collect', async (_i) => {
            throw collector.stop('time');
        }).once('end', async (_c, r) => {
            if (r !== 'limit' && r !== 'force_stop') throw message.deleteReply(true);
        });
    }
});