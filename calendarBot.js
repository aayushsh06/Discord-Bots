require('dotenv/config');
const { Client, Intents } = require('discord.js');
const client = new Client({ intents: ['Guilds', 'GuildMembers', 'GuildMessages', 'MessageContent'] });
const moment = require('moment');

client.on('ready', () => {
    console.log(`The bot is online as ${client.user.tag}`);
});

client.on('messageCreate', async message => {
    if (message.author.bot) return;

    if (message.content.startsWith('!remindin')) {
        const args = message.content.split(' ').slice(1);
        const delayInMinutes = parseInt(args.shift());
        const reminder = args.join(' ');

        if (isNaN(delayInMinutes) || delayInMinutes <= 0 || !reminder) {
            return message.reply('Please provide a valid delay in minutes and a reminder message. Example: `!remindin 10 Take a break!`');
        }

        await message.channel.sendTyping();

        await new Promise(resolve => setTimeout(resolve, 1000));

        const reminderTime = moment().add(delayInMinutes, 'minutes');
        const replyMessage = await message.reply(`Reminder set for ${reminderTime.format('hh:mm A')} (${reminderTime.fromNow()}).`);

        setTimeout(() => {
            replyMessage.delete().catch(error => console.error('Error deleting message:', error));
        }, 5 * 60 * 1000);

        setTimeout(async () => {
            try {
                await message.author.send(`⏰ Reminder: ${reminder}`);
            } catch (error) {
                console.error('Error sending DM:', error);
            }
        }, delayInMinutes * 60 * 1000);
    }

    else if (message.content.startsWith('!remindat')) {
        const args = message.content.split(' ').slice(1);
        let timeInput = args.shift();
        const ampm = args.find(arg => /^(AM|PM)$/i.test(arg)) || 'PM'; 
        const reminder = args.filter(arg => !/^(AM|PM)$/i.test(arg)).join(' ');

        await message.channel.sendTyping();

        await new Promise(resolve => setTimeout(resolve, 1000));

        if (!moment(`${timeInput} ${ampm}`, 'h:mm A', true).isValid()) {
            return message.reply('Please provide a valid time in HH:mm format followed by AM or PM and a reminder message. Example: `!remindat 2:30 PM Take a break!`');
        }

        const now = moment();
        const formattedTime = `${now.format('YYYY-MM-DD')} ${timeInput} ${ampm}`;
        let reminderTime = moment(formattedTime, 'YYYY-MM-DD h:mm A', true);

        if (!reminderTime.isValid()) {
            return message.reply('Please provide a valid time in HH:mm format followed by AM or PM and a reminder message. Example: `!remindat 2:30 PM Take a break!`');
        }

        if (reminderTime.isBefore(now)) {
            reminderTime.add(1, 'day');
        }

        const replyMessage = await message.reply(`Reminder set for ${reminderTime.format('hh:mm A')} (${reminderTime.fromNow()}).`);

        setTimeout(() => {
            replyMessage.delete().catch(error => console.error('Error deleting message:', error));
        }, 1 * 60 * 1000);

        const delay = reminderTime.diff(now);

        setTimeout(async () => {
            try {
                await message.author.send(`⏰ Reminder: ${reminder}`);
            } catch (error) {
                console.error('Error sending DM:', error);
            }
        }, delay);
    }
});

client.login(process.env.TOKEN);
