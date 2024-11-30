const { Client, GatewayIntentBits, ButtonBuilder, ActionRowBuilder, ButtonStyle, PermissionsBitField, SlashCommandBuilder, REST, Routes } = require('discord.js');
const { application } = require('express');
require('dotenv').config();

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent
    ] 
});

const masterRoleId = '1280924603300184148'

// Глобальна змінна mafiaMembers
let mafiaMembers = [];
let mafiaMembersMessage;
let mafiaActivity = false;
let arreyRoles = ['mafia', 'mafia', 'doctor', 'sheriff', 'civilian', 'civilian'];
let mafiaMembersAndRoles = [];

let mafiaRoleChannel = '1280922264166207568'
let sheriffRoleChannel = '1280922448736423946'
let doctorRoleChannel = '1280922295522558052'

let masterChannel = '1280923487740887133'
let mafiaChannel = '1280922630186074144'

let buttonCloseRegistration;
let buttonSelectedRoles;
let buttonRegistration;
let row;

let updatedMessage;
let updatedMassageMaster;

async function ephemeralReply(interaction, content, seconds) {
    const reply = await interaction.reply({ content, ephemeral: true });
    setTimeout(async () => {
        await interaction.deleteReply();
    }, seconds * 1000);
}

function shuffleArray(array) {
  // Fisher-Yates shuffle
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}


async function countEvenOdd(to) {
    let evenCount = 0;
    let oddCount = 0;
  
    for (let i = 1; i <= to; i++) {
      if (i % 2 === 0) {
        evenCount++;
      } else {
        oddCount++;
      }
    }
  
    return { evenCount, oddCount }; // Повертаємо результат як об'єкт
  }

async function addCivilianAndMafia(arrey, countCivilian, countMafia) {
    for (let i = 1; i <= countCivilian; i++){
        arrey.push('civilian');
    }
    for (let i = 1; i <= countMafia; i++){
        arrey.push('mafia');
    }
}

async function deletePermissionOverwrites(channel) {
    channel.lockPermissions()
    .then(() => console.log('Канал був синхронізований з розділом.'))
    .catch(console.error);
}


client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);



    // Реєстрація slash-команд після того, як бот повністю ініціалізований
    const commands = [
        new SlashCommandBuilder().setName('ping').setDescription('Replies with Pong!'),
        new SlashCommandBuilder().setName('mafia').setDescription('Lox out'),
    ].map(command => command.toJSON());

    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }


    mafiaRoleChannel = client.channels.cache.get(mafiaRoleChannel)
    sheriffRoleChannel = client.channels.cache.get(sheriffRoleChannel)
    doctorRoleChannel = client.channels.cache.get(doctorRoleChannel)
    masterChannel = client.channels.cache.get(masterChannel)
    mafiaChannel = client.channels.cache.get(mafiaChannel);


    deletePermissionOverwrites(mafiaRoleChannel)
    deletePermissionOverwrites(sheriffRoleChannel)
    deletePermissionOverwrites(doctorRoleChannel)

});

client.on('interactionCreate', async interaction => {

    // КНОПКИ КНОПКИ КНОПКИ КНОПКИ КНОПКИ КНОПКИ КНОПКИ КНОПКИ КНОПКИ КНОПКИ КНОПКИ КНОПКИ КНОПКИ КНОПКИ 

    if (interaction.isButton() && interaction.customId === 'buttonCloseRegistration') {
        if (interaction.member.roles.cache.has('1147082993861664818')){
            mafiaActivity = false;
            ephemeralReply(interaction, 'Реєстрацію закрито!', 5)
        }
        else{
            ephemeralReply(interaction, 'Куда ты лезешь? Жди докс :wheelchair:', 5)
        }
    }

    if (interaction.isButton() && interaction.customId === 'buttonRegistration') {
        if (mafiaActivity && mafiaChannel){
            // if (mafiaMembers.includes(interaction.member.id)){
            //     await ephemeralReply(interaction, 'U are already registered', 5);
            //     return;
            // }
            mafiaMembers.push(interaction.member.id);
            updatedMessage = `Учасники мафії (${mafiaMembers.length}):\n${mafiaMembers.map(id => `<@${id}>`).join('\n')}`;
            await mafiaMembersMessage.edit(updatedMessage);
            ephemeralReply(interaction, 'Успішно зареєстрований!', 5)
            // interaction.user.send('ти лох');
        }
        else{
            ephemeralReply(interaction, 'Error', 5);
        }
    }

    if (interaction.isButton() && interaction.customId === 'buttonSelectedRoles') {
        if (mafiaChannel && mafiaMembers.length >= 6){
            if (interaction.member.roles.cache.has('1147082993861664818')){
                let countM = mafiaMembers.length - 6;
                addCivilianAndMafia(arreyRoles, (await countEvenOdd(countM)).oddCount, (await countEvenOdd(countM)).evenCount)
                // console.log(arreyRoles)
                arreyRoles = shuffleArray(arreyRoles) // doesn't work

                

                if (mafiaMembers.length === arreyRoles.length){
                    for (let i = 0; i < mafiaMembers.length; i++){
                        mafiaMembersAndRoles.push({ member: mafiaMembers[i], role: arreyRoles[i], status: "alive" })
                    }
                }
                
                console.log(mafiaMembersAndRoles)

                for (let object of mafiaMembersAndRoles){
                    const user = await client.users.fetch(object.member);
                    if (user){
                        user.send(`Твоя роль - ${object.role}`)
                        
                        if (object.role === 'mafia'){
                            mafiaRoleChannel.permissionOverwrites.edit(user, {
                                [PermissionsBitField.Flags.ViewChannel]: true
                            })
                        }

                        if (object.role === 'sheriff'){
                            sheriffRoleChannel.permissionOverwrites.edit(user, {
                                [PermissionsBitField.Flags.ViewChannel]: true
                            })
                        }

                        if (object.role === 'doctor'){
                            doctorRoleChannel.permissionOverwrites.edit(user, {
                                [PermissionsBitField.Flags.ViewChannel]: true
                            })
                        }
                    }
                }

                updatedMassageMaster = mafiaMembersAndRoles
                    .map(item => `${item.status == "alive" ? ':green_circle:' : ':red_circle:'} <@${item.member}> - ${item.role}`)
                    .join('\n');
                updatedMassageMaster = `Учасники мафії (${mafiaMembersAndRoles.length}):\n` + updatedMassageMaster
                await masterChannel.send(updatedMassageMaster)
                
                updatedMessage = mafiaMembersAndRoles
                    .map(item => `${item.status == "alive" ? ':green_circle:' : ':red_circle:'} <@${item.member}>`)
                    .join('\n');
                updatedMessage = `Учасники мафії (${mafiaMembersAndRoles.length}):\n` + updatedMessage
                await mafiaMembersMessage.edit({ content: updatedMessage, components: [] });

                ephemeralReply(interaction, 'Успішно!', 5)
            }
        }
        else{
            ephemeralReply(interaction, 'Учасників мафії не має бути менше 6', 10)
        }
    }
    
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    // КОМАНДИ КОМАНДИ КОМАНДИ КОМАНДИ КОМАНДИ КОМАНДИ КОМАНДИ КОМАНДИ КОМАНДИ КОМАНДИ КОМАНДИ КОМАНДИ 

    if (commandName === 'ping') {
        await interaction.reply({ content: 'Pong!', ephemeral: true });
    } 
    else if (commandName === 'mafia') {
        if (!mafiaActivity){
            if (!interaction.member.roles.cache.has('1147082993861664818')){
                ephemeralReply(interaction, 'Куда ты лезешь? Жди докс :wheelchair:', 5)
                return;
            }
            mafiaActivity = true;
            
            buttonRegistration = new ButtonBuilder()
            .setCustomId('buttonRegistration')
            .setLabel('Зареєструватися')
            .setStyle(ButtonStyle.Success);

            buttonCloseRegistration = new ButtonBuilder()
                .setCustomId('buttonCloseRegistration')
                .setLabel('Закрити реєстрацію')
                .setStyle(ButtonStyle.Danger);
            
            buttonSelectedRoles = new ButtonBuilder()
                .setCustomId('buttonSelectedRoles')
                .setLabel('Розподілити ролі')
                .setStyle(ButtonStyle.Danger);

            row = new ActionRowBuilder().addComponents(buttonRegistration, buttonCloseRegistration, buttonSelectedRoles);
            mafiaMembersMessage = await mafiaChannel.send({ content: 'Учасники мафії:\nПорожньо', components: [row] });
            
            ephemeralReply(interaction, 'Mafia started', 5);
            console.log('start');
            return;
        }
    }
    
});

client.login(process.env.TOKEN);