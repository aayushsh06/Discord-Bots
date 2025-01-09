require('dotenv/config');
const {Client} = require('discord.js');
const {OpenAI} = require('openai');
const punycode = require('punycode');

const client = new Client({
    intents : ['Guilds', 'GuildMembers', 'GuildMessages', 'MessageContent']
});

client.on('ready', () =>{
    console.log('Bot is Online');
}); 

const IGNORE_PREFIX = "!";
const CHANNELS = ['1271932733878173716'];

const openai = new OpenAI({
    apiKey: process.env.OPENAI_KEY,
})

client.on('messageCreate', async (message) =>{
    if(message.author.bot) return;
    if(message.content.startsWith(IGNORE_PREFIX)) return;
    if(!CHANNELS.includes(message.channelId) && !message.mentions.users.has(client.user.id)) return;

    await message.channel.sendTyping();

    const response = await openai.chat.completions
        .create({
            model : 'gpt-3.5-turbo',
            messages:[
                {
                    role: 'system',
                    content: 'AI BOT is a friendly and informative chatbot.'
                },
                {
                    role: 'user',
                    content: message.content,
                },
            ],
        })
        .catch((error) => console.error('OpenAI Error: \n', error));

        if(!response){
            message.reply("I'm having some trouble with the OpenAI API. Try again in a moment.");
            return;
        }

    message.reply(response.choices[0].message.content); 
     
});

client.login(process.env.TOKEN); 
