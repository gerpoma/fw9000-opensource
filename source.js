//require() function, this is a module for some reason
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

//Express and Axios <3
const express = require('express');
const axios = require('axios');
axios.defaults.timeout = 120000;
const app = express();
const port = 3001;

//variables!!
let addmin = ["1024228169395482675", "460496281358434304"];
let logChannels = [];//["1147976618455859271"];
let blacklist = [

];
let words = [];
let wordsForWords = [];
let repsonse = "";

//Express <3
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
})

//Ton of random stuff that is used later in the code

//DiscordJS
import DiscordJS, { Intents } from "discord.js";
const { Attachment, Collection } = require("discord.js");
const { SlashCommandBuilder } = require('@discordjs/builders');
const {
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
    getVoiceConnection
} = require('@discordjs/voice');
import dotenv from "dotenv";

//stream, util n fs!!
import * as stream from 'stream';
import util, { promisify } from 'util';
import fs, { createWriteStream } from 'fs';

//UUID stuff
const { v4: uuidv4, v1: uuidv1 } = require('uuid');

const uuidtd = require('./uuidtd.cjs');

const crypto = require('crypto');

///Logging

const filenaem = './logs/current-'+crypto.randomUUID()+".log";

var log_file = fs.createWriteStream(filenaem, {flags : 'w'});
var log_stdout = process.stdout;

console.log = function(d) { //
  log_file.write(util.format("[INFO] %s",d) + '\n');
  log_stdout.write(util.format(d) + '\n');
};

console.error = function(d) { //
  log_file.write(util.format("[ERROR] %s",d) + '\n');
  log_stdout.write(util.format(d) + '\n');
};

//JSON Database Logging
let db = {};
//var dbFile = fs.createWriteStream("./db.json", {flags : 'w'});
console.log("Opening database file..");
try {
db = JSON.parse(fs.readFileSync("./db.json"));
} catch (eee) {
db = {};
console.error(eee);
}
console.log("Done!");

async function saveMessage(message) {
  if (!db[message.author.id]) {
    db[message.author.id] = [];
  }
  if (message.author.id == client.user.id) {
    return;
  }
  db[message.author.id].push({ content:message.content,authorId:message.author.id,dm:message.channel.type == 'DM' });
  fs.writeFile('./db.json', JSON.stringify(db, null, 2), function(){});
  console.log("Message saved!");
}

async function getMessages(id) {
  //let lim = offset !== null ? offset+", "+limit : limit;
  console.log("Ordering messages from "+id);
  return db[id];
}

//UUID generating

const startupUUID = uuidv1();

//DeployHistory

console.log("Loading deploy history..");

let test = await axios.get("https://setup.rbxcdn.com/DeployHistory.txt");
     
let radnom = test.data.split('\n');

//http://setup.gametest2.robloxlabs.com/DeployHistory.txt im sad

let testWhy = await axios.get("http://setup.gametest2.robloxlabs.com/DeployHistory.txt");
     
let radnomFuck = testWhy.data.split('\n');

console.log("Done!");

//Emitter stuff

import { EventEmitter } from 'node:events';
class ClientEmitter extends EventEmitter {}
const emitting = new ClientEmitter();

//Plugin loader

let plugins = JSON.parse(fs.readFileSync("./plugs.json")); //plugs.json NEEDS TO EXIST (and be a valid json file)
let newPlugins = {};


function antiCache(path) {
    delete require.cache[require.resolve(path)];
}

function loadPlugins() {
  let i = 0;

  while (i < plugins.length) {
      console.log("Loading plugin "+plugins[i].name);
      antiCache(plugins[i].path);
      const plugin = require(plugins[i].path);
      newPlugins[plugins[i].name] = plugin;
      newPlugins[plugins[i].name].init(emitting, DiscordJS, axios);
      console.log("Monitoring plugin: "+plugins[i].name);
      console.log("Loaded plugin "+plugins[i].name);
      i++;
  }
}

const finished = promisify(stream.finished); //i forgot what this does but DONT REMOVE IT

//File downloading stuff

async function downloadFile(fileUrl, outputLocationPath) {
  const writer = createWriteStream(outputLocationPath);
  return axios({
    method: 'get',
    url: fileUrl,
    responseType: 'stream',
  }).then(response => {
    response.data.pipe(writer);
    return finished(writer); //this is a Promise
  });
}

//Channel ID for the message-sending stuff
var ied = "";

//Admin thingy

function removeUser(id, msg) {
    var index = addmin.indexOf(id);
    if (index !== -1) {
    addmin.splice(index, 1);
    msg.reply("Removed user successfully!");
    } else {
    msg.reply("User doesnt exist..");
    }
}

function isAdmin(id) {
    return addmin.includes(id);
}

function isTrusted(id) {
    return id == "1024228169395482675"; //my id :3
}

function addUser(id, msg) {
    if (!addmin.includes(id)) {
        addmin.push(id);
        msg.reply("Successfully ranked user.");
    } else if (blacklist.includes(id)) {
        msg.reply("User is blacklisted from being an admin. Ask the owner about it..");
    } else {
        msg.reply("User is already a admin!");
    }
}

//will be used soon
dotenv.config();

//the client itself
const client = new DiscordJS.Client({
  partials: ["CHANNEL"],
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.DIRECT_MESSAGES]
});

client.commandList = new Collection();

console.log("Starting..."); //start the loading process

let pingCmd = new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with pong');
        
client.commandList.set('ping', pingCmd);

client.commandList.set("purge", new SlashCommandBuilder()
        .setName('purge')
        .setDescription('Deletes all messages in a channel'));

client.commands = new Collection();

client.commands.set("ping", async (interaction) => {
    await interaction.reply("Pong!");
});

client.commands.set("purge", async (interaction) => {
    if (!isAdmin(interaction.user.id)) {
        await interaction.reply("you are not a admin, dummy..");
    }
    let msggg = await interaction.channel.send("fetching messages..");
    let fetcheed = await interaction.channel.messages.fetch({limit: 100});
    let i=0;
    let fetched=[];
    console.log(fetcheed);
    interaction.channel.bulkDelete(fetcheed);
    msggg.delete();
    interaction.reply("done");
});

//let server owners such as Deimanté use the bot
async function addGuild(guild) {
    await guild.commands.set(client.commandList);
    const bb = await guild.fetchOwner();
    if (!bb) {
        console.log("Failed to fetch owner of guild: "+guild.id);
        return;
    }
    if (!addmin.includes(bb.id)) {
        addmin.push(bb.id);
        console.log('adding owner of guild '+guild.id+" => "+guild.name+": "+bb.id+" => "+bb.user.tag);
    }
}

//messaging stuff, also used for the express backdoor
async function mehssage(msg) {
let channel = await client.channels.fetch("1147976618455859271");
channel.send(msg);
//channel = await client.channels.fetch("1148206935125000242");
//channel.send(msg);
}

async function no() {
let guild = await client.guilds.cache.get('1131880428249305108');
let meh = await guild.members.fetch('1024228169395482675');
meh.timeout(null);
}

//ready!
client.on("ready", () => {
  emitting.emit("started"); //emitter!!
  console.log(`the bot is online!`);
  console.log('loading guild owners and setting them as admins..');
  client.guilds.cache.each(guild => addGuild(guild)); //automatically sets guild owners as admins
  client.user.setPresence({
  activities: [{ name: `Roblox`, type: 0 }],
  status: 'idle',
  }); //presence stuff
  console.log("sending log messages.."); //logs events to certain channels
    try {
    //mehssage("Start up! ID = "+startupUUID);
    } catch (what) { //tf
    console.log("what..");
    console.error(what);
    }
  console.log('done!'); //complete!
  //no();
});

//waiting function
function wait5(waitTime) {

  return new Promise ((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, waitTime);
  });
  
}

function makeid(length) { //random string gen
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$_&-+()/*?"!\';:~`|•√π÷×§∆£\¢}€{¥=^°%]©[®✓™';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}

//random int (max needs to be max + 1 for accurate values)
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

//voice stuff
client.on("voiceStateUpdate", (oldVoiceState, newVoiceState) => { // Listeing to the voiceStateUpdate event
    emitting.emit("voiceStateUpdate", oldVoiceState, newVoiceState);
    if (newVoiceState.channel) { // The member connected to a channel.
        console.log(`${newVoiceState.member.user.tag} connected to ${newVoiceState.channel.name}.`);
    } else if (oldVoiceState.channel) { // The member disconnected from a channel.
        console.log(`${oldVoiceState.member.user.tag} disconnected from ${oldVoiceState.channel.name}.`)
    };
});

function getVersion() {
  return "0.84"; //curr version
}

//the command system
let cmd = [];
let cmds = [];

function register(cmd, info) { //Registers command to be shown in >help.
  cmds.push({ "cmd":cmd, "info":info });
}

function registerPluginCommand(func, registerHelp, cmdd, info) { //Registers plugin command.
  if (cmd[cmdd]) {
      console.log("Already registered..");
      return;
  }
  cmd[cmdd] = func;
  if (registerHelp) {
  cmds.push({ "cmd":cmdd, "info":info });
  }
  console.log("Added command: "+cmdd);
}

emitting.on("registerCmd", registerPluginCommand); //process emitter commands/events

//BUILT-IN COMMANDS - modified for the loader command

async function reload(typei, message) {
let timer = Date.now();
console.log(typei+"ing..");
if (message) {
message.reply(typei+"ing..");
}
cmd = [];
cmds = [];
newPlugins = {};

cmd.render = async function(msgg, message) {
  if (msgg[0] === ">render") {
    if (!isAdmin(message.author.id)) {
      message.reply("You don't have permission to do that.");
      return;
    }
    try {
    let abortController = new AbortController()
    const timeout = setTimeout(() => {
        abortController.abort()
        console.log("Aborted")
    }, 120000)
    
    let res1 = await axios.post("https://users.roblox.com/v1/usernames/users", {
  "usernames": [
    msgg[1]
  ],
  "excludeBannedUsers": false
}, { signal: abortController.signal, timeout: 120000 });
    clearTimeout(timeout);
    if (!res1.data.data[0]) {
    throw Error("User does not exist! 😠");
    }
    const userId = res1.data.data[0].id;
    
    console.log(userId);
    
    let abortCuontroller = new AbortController()
    const timeeout = setTimeout(() => {
        abortCuontroller.abort()
        console.log("Aborted")
    }, 120000)
    
    let res2 = await axios.get("https://thumbnails.roblox.com/v1/users/avatar?userIds="+userId+"&size=352x352&format=Png&isCircular=false", { signal: abortController.signal, timeout: 120000 });
    clearTimeout(timeeout);
    
    const shoturl = res2.data.data[0].imageUrl;
    
    let mesvsage = new DiscordJS.MessageAttachment(shoturl,"ERRORIMAGE.png");

    await message.reply({
      files: [mesvsage] //can attach multiple files, simply add more commma delimited filepaths
    });
    } catch (idk) {
      message.reply("Something went wrong.. 😥\n\n```"+idk.name+": "+idk.message+"```");
      console.log(idk);
    }
  }
  }
  
  register("render", "Renders a Roblox avatar.");
  
  cmd.renderLimbo = async function(msgg, message) {
  if (msgg[0] === ">renderLimbo") {
    if (!isAdmin(message.author.id)) {
      message.reply("You don't have permission to do that.");
      return;
    }
    try {
    let abortController = new AbortController()
    const timeout = setTimeout(() => {
        abortController.abort()
        console.log("Aborted")
    }, 120000)
    
    let res1 = await axios.get("https://api.voidrev.us/users/get-by-username?username="+msgg[1], { signal: abortController.signal, timeout: 120000 });
    clearTimeout(timeout);
    if (!res1.data.Id) {
    throw Error("User does not exist! 😠");
    }
    const userId = res1.data.Id;
    
    console.log(userId);
    
    const shoturl = "https://www.voidrev.us/Thumbs/Avatar.ashx?userId="+userId;

    let mesvsage = new DiscordJS.MessageAttachment(shoturl,"ERRORIMAGE.png");

    await message.reply({
      files: [mesvsage] //can attach multiple files, simply add more commma delimited filepaths
    });
    } catch (idk) {
      message.reply("Something went wrong.. 😥\n\n```"+idk.name+": "+idk.message+"```");
      console.log(idk);
    }
  }
  }
  
  register("renderLimbo", "Renders a Limbo avatar. (thx wumbo for fixing apis)");
  
  cmd.dicksucker = async function(msgg, message) {
  if (msgg[0] == ">dicksucker") {
    if (!isAdmin(message.author.id)) {
      message.reply("You don't have permission to do that.");
      return;
    }
    let role = message.member.guild.roles.cache.find(role => role.name === "dicksucker :3");
    const ment = message.mentions.users.first();
    if (!ment) {
      message.reply({content: "wtf.. no mention?"});
      return;
    }
    if (role) {
        try {
        await message.guild.members.cache.get(ment.id).roles.add(role);
        await message.channel.send("<@"+ment.id+"> is a dicksucker!");
        } catch (what) {
        message.reply("Couldn't add role😥");
        }
    }
  }
  }
  
  register("dicksucker", "");
  
  cmd.ss = async function(msgg, message) {
  if (msgg[0] == ">ss") {
    if (!isAdmin(message.author.id)) {
      message.reply("You don't have permission to do that.");
      return;
    }
    if (!msgg[1]) {
      message.reply("No link detected..");
      return;
    }
    try {
    message.channel.send("Downloading..");
    await downloadFile("https://api.apiflash.com/v1/urltoimage?access_key=d66ee54e8949436abe1b1c1156d99772&wait_until=page_loaded&url="+msgg[1], "./a.png");
    let mesvsage = new DiscordJS.MessageAttachment("./a.png","I don't fucking know.png");
    
    await message.reply({
      files: [mesvsage] //can attach multiple files, simply add more commma delimited filepaths
    });
    } catch (down) {
      message.reply("Something went wrong.. Is the screenshot API down?\n\n```"+down.name+": "+down.message+"```");
      console.log(down);
    }
  }
  }
  
  register("ss", "Screenshots a URL.");
  
  cmd.alldeployhistoryentries = async function(msgg, message) {
  if (msgg[0] == ">alldeployhistoryentries") {
    if (!isAdmin(message.author.id)) {
      message.reply("You don't have permission to do that.");
      return;
    }
    const splitb = radnom;
    let i = 0;
    while (i<splitb.length) {
      if (splitb[i] !== '\r' || splitb[i] !== '\n' || splitb[i] !== '\r\n') { //avoid line breaks
      try {
      await message.channel.send(splitb[i]);
      } catch (what) {
      console.log("what..");
      }
      }
      wait5(250);
      i++;
    }
    message.channel.send("done :3");
  }
  }
  
  cmd.gayrate = function(msgg, message) {
  if (msgg[0] == ">gayrate") {
    const men = message.mentions.users.first();
    if (!men) {
    message.reply({ content: "You are "+getRandomInt(102)+"% gay.." });
    } else {
    if (men.id !== "1114477659242647583" && men.id !== "1024228169395482675" && men.id !== "460496281358434304" && men.id !== "1152670980452401344") {
    message.channel.send("<@"+men.id+"> is "+getRandomInt(201)+"% gay..");
    } else {
    message.channel.send("<@"+men.id+"> is "+"145769770486703926669137700174181370409209110449761463904094252590409422379396593349305888394330706969186332956"+"% gay..");
    }
    }
  }
  }
  
  register("gayrate", "");
  
  cmd.ship = async function(msgg, message) {
  if (msgg[0] == ">ship") {
    await message.guild.members.fetch();  
    let test = message.guild.members.cache.random();
    while (test === message.me) {
    test = message.guild.members.cache.random();
    }
    const men = message.mentions.users.first();
    if (!men) {
      message.channel.send("I'm shipping <@"+message.author.id+"> with <@"+test.id+">.");
    } else {
      while (test === men) {
      test = message.guild.members.cache.random();
      }
      message.channel.send("I'm shipping <@"+men.id+"> with <@"+test.id+">.");
    }
  }
  }
  
  register("ship", "Ships two guild members.");
  
  cmd.playsmth = function(msgg, message) {
  if (msgg[0] == ">playsmth") {
      if (!isAdmin(message.author.id)) {
      message.reply("You don't have permission to do that.");
      return;
      }
        if (!message.member.voice.channelId) return message.channel.send('You need to be a voice channel to execute this command..')
        
        
        const connection = joinVoiceChannel({
            channelId: message.member.voice.channelId,
            guildId: message.guildId,
            adapterCreator: message.guild.voiceAdapterCreator
        })

        const player = createAudioPlayer()
        const resource = createAudioResource(msgg[1])

        connection.subscribe(player)

        player.play(resource)
        player.on('error', error => {
	      console.error(`Error: ${error.message} with resource ${error.resource.metadata.title}`);
        });
  }
  }
  
  register("playsmth", "Plays a audio that the bot has access to.");
  
  cmd.disconnect = function(msgg, message) {
  if (msgg[0] == ">disconnect") {
    if (!isAdmin(message.author.id)) {
      message.reply("You don't have permission to do that.");
      return;
    }
    const connection = getVoiceConnection(message.guild.id);
    if (connection) {
      connection.destroy();
    } else {
      message.reply("Not connected to any channel..");
    }
  }
  }
  
  register("disconnect", "Stops playing and disconnects from the current voice channel.");
  
  cmd.admin = function(msgg, message) {
  if (msgg[0] == ">admin") {
    if (!isAdmin(message.author.id)) {
      message.reply("You don't have permission to do that.");
      return;
    }
    if (!message.mentions.users.first()) {
        message.reply("No mention detected..");
        return;
    }
    addUser(message.mentions.users.first().id, message);
  }
  }
  
  register("admin", "Ranks a user.");
  
  cmd.unadmin = function(msgg, message) {
  if (msgg[0] == ">unadmin") {
    if (!message.mentions.users.first()) {
      if (message.author.id == "1024228169395482675") {
        message.reply("You cant unadmin yourself.. silly.");
        return;
      }
      removeUser(message.author.id, message);
    } else {
      if (!isAdmin(message.author.id)) {
      message.reply("You don't have permission to do that.");
      return;
      }
      if (message.mentions.users.first().id == "1024228169395482675") {
        message.reply("You cant unadmin the owner.. 😡.");
        return;
      }
      removeUser(message.mentions.users.first().id, message);
    }
  }
  }
  
  register("unadmin", "Unranks a user.");
  
  cmd.utels = function(msgg, message) {
  if (msgg[0] == ">utels") {
    message.reply("UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels UTels");
  }
  }
  
  register("utels", "UTels");
  
  cmd.renderModel = async function(msgg, message) {
  if (msgg[0] == ">renderModel") {
    if (!isAdmin(message.author.id)) {
      message.reply("You don't have permission to do that.");
      return;
    }
    try {
    //https://thumbnails.roblox.com/v1/assets?assetIds=1818&returnPolicy=PlaceHolder&size=768x432&format=Png&isCircular=false
    const shiturl = "https://thumbnails.roblox.com/v1/assets?assetIds="+msgg[1]+"&returnPolicy=PlaceHolder&size=768x432&format=Png&isCircular=false";

    let rsp = await axios.get(shiturl);
    
    const shoturl = rsp.data["data"][0]["imageUrl"];

    let mesvsage = new DiscordJS.MessageAttachment(shoturl,"ERRORIMAGE.png");

    await message.reply({
      files: [mesvsage] //can attach multiple files, simply add more commma delimited filepaths
    });
    } catch (idk) {
      message.reply("Something went wrong.. 😥\n\n```"+idk.name+": "+idk.message+"```");
      console.log(idk);
    }
  }
  }
  
  register("renderModel", "Renders a model.");
  
  cmd.version = function(msgg, message) {
    if (msgg[0] == ">version") {
      message.reply({ content: "```"+getVersion()+"```" });
    }
  }
  
  register("version", "Current version of the bot.");
  
  cmd.react = async function(msgg, message) {
    if (msgg[0] == ">react") {
      const ttt = await message.fetchReference();
      if (ttt) {
      ttt.react("👍");
      }
    }
  }
  
  register("react", "👍");
  
  cmd.dumpLogs = async function(msgg, message) {
    if (msgg[0] == ">dumpLogs") {
        //a
    }
  }
  
  register("dumpLogs", "Dumps logs in a specific channel. 😉");
  
  //https://th.bing.com/th?q= thx UTels
  
  cmd.bing = async function(msgg, message) {
    if (msgg[0] == ">bing") {
      if (!isAdmin(message.author.id)) {
        message.reply("You don't have permission to do that.");
        return;
      }
      const shoturl = "https://th.bing.com/th?q="+message.content.split(/\s(.*)/s)[1];

      let mesvsage = new DiscordJS.MessageAttachment(shoturl,"SPOILER_ERRORIMAGE.png");

      await message.reply({
        files: [mesvsage] //can attach multiple files, simply add more commma delimited filepaths
      });
    }
  }
  
  register("bing", "Returns a image from Bing. (thx UTels)");
  
  cmd.randomdeployhistory = async function(msgg, message) {
    if (msgg[0] == ">randomdeployhistory") {
      
      message.reply({ content: "```"+radnom[getRandomInt(radnom.length + 1)]+"```" });
    }
  }
  
  register("randomdeployhistory", "Takes random entry from rbxcdn's DeployHistory");
  
  //http://setup.gametest2.robloxlabs.com/DeployHistory.txt
  
  cmd.randomgametest2deployhistory = async function(msgg, message) {
    if (msgg[0] == ">randomgametest2deployhistory") {
      
      message.reply({ content: "```"+radnomFuck[getRandomInt(radnomFuck.length + 1)]+"```" });
    }
  }
  
  register("randomgametest2deployhistory", "Takes random entry from idk DeployHistory");
  
  cmd.randommultipledeployhistory = async function(msgg, message) {
    if (msgg[0] == ">randommultipledeployhistory") {
      if (!isAdmin(message.author.id)) {
        message.reply("You don't have permission to do that.");
        return;
      }
      
      message.reply({ content: radnom[getRandomInt(radnom.length + 1)]+"\n"+radnom[getRandomInt(radnom.length + 1)]+"\n"+radnom[getRandomInt(radnom.length + 1)]+"\n"+radnom[getRandomInt(radnom.length + 1)]+"\n"+radnom[getRandomInt(radnom.length + 1)]+"\n"+radnom[getRandomInt(radnom.length + 1)]+"\n"+radnom[getRandomInt(radnom.length + 1)]+"\n"+radnom[getRandomInt(radnom.length + 1)]+"\n"+radnom[getRandomInt(radnom.length + 1)]+"\n"+radnom[getRandomInt(radnom.length + 1)] });
    }
  }
  
  register("randommultipledeployhistory", "Takes 10 random entries from rbxcdn's DeployHistory (admin cuz this can crash the bot)");
  
  cmd.randomuuid = function(msgg, message) {
    if (msgg[0] == ">randomuuid") {
      message.reply({ content:uuidv4() });
    }
  }
  
  register("randomuuid", "Generates a random UUID.");
  
  cmd.randomstring = function(msgg, message) {
    if (msgg[0] == ">randomstring") {
      message.reply({ content:makeid(128) });
    }
  }
  
  register("randomstring", "Generates a random string.");
  
  cmd.decodeloguuid = function(msgg, message) {
    if (msgg[0] == ">decodeloguuid") {
      try {
      let daet = uuidtd.get_date_obj(msgg[1]);
      message.reply({ content:daet.toUTCString()+"" });
      } catch (idk) {
      message.reply({ content:"Something went wrong.." });
      console.error(idk);
      }
    }
  }
  
  register("decodeloguuid", "Decodes a certain UUID.");
  
  cmd.shutdown = async function(msgg, message) {
    if (msgg[0] == ">shutdown") {
      if (!isAdmin(message.author.id)) {
        message.reply("You don't have permission to do that.");
        return;
      }
      await message.reply("Bye-bye");
      try {
      //await mehssage("Manual shutdown..");
      console.log("Shutdown complete..");
      wait5(1250);
      client.destroy();
      process.exit(0);
      } catch (what) {
      console.log("wtf..");
      console.error(what);
      }
    }
  }
  
  cmd.getMessages = async function(msgg, message) {
    if (msgg[0] == ">getMessages") {
      let aaa = await getMessages(msgg[1], msgg[2], msgg[3]);
      if (!aaa) {
        message.reply("No such user was logged or you didnt provide a id..");
      }
      message.reply({ files:[new DiscordJS.MessageAttachment(Buffer.from(JSON.stringify(aaa, null, 2), "utf-8"), "stuff.json")] });
    }
  }
  
  register("getMessages", "Gets logged messages from a certain database.");
  
  cmd.dumpDb = function(msgg, message) {
    if (msgg[0] == ">dumpDb") {
      if (!isTrusted(message.author.id)) {
        message.reply("You don't have permission to do that.");
        return;
      }
      let mesvsage = new DiscordJS.MessageAttachment("./db.json","db.json");

      message.reply({
        content: "Latest dump of the database:",
        files: [mesvsage] //can attach multiple files, simply add more commma delimited filepaths
      });
    }
  }
  
  register("dumpDb", "Dumps database as file.");
  
  cmd.uploadFile = async function(msgg, message) {
    if (msgg[0] == ">uploadFile") {
      if (!isAdmin(message.author.id)) {
        message.reply("You don't have permission to do that/You're not trusted.");
        return;
      }
      const attachment = message.attachments.first();
      const url = attachment ? attachment.url : null;
      if (url) {
        var URL = require('url').parse(url);
        if (!URL.pathname.substring(URL.pathname.lastIndexOf('/')+1)) {
          message.reply("Invalid attachment!");
          return;
        }
        message.reply("Downloading..");
        await downloadFile(url, "./Downloads/"+URL.pathname.substring(URL.pathname.lastIndexOf('/')+1));
        message.reply("Download complete!");
      } else {
        message.reply("No attachment detected!");
        return;
      }
    }
  }
  
  register("uploadFile", "Makes the bot download a attachment.");
  
  function checkFileExistsSync(filepath){
    let flag = true;
    try{
      fs.accessSync(filepath, fs.constants.F_OK);
    }catch(e){
      flag = false;
    }
    return flag;
  }
  
  cmd.sendFile = async function(msgg, message) {
    if (msgg[0] == ">sendFile") {
      if (!isAdmin(message.author.id) || !isTrusted(message.author.id)) {
        message.reply("You don't have permission to do that/You're not trusted.");
        return;
      }
      if (!msgg[1]) {
        message.reply("Missing file path!");
        return;
      }
      if (!checkFileExistsSync(msgg[1])) {
        message.reply("No such file!");
        return;
      }
      try {
      let mesvsage = new DiscordJS.MessageAttachment(msgg[1], msgg[1].substring(msgg[1].lastIndexOf('/')+1));

      await message.reply({
        content: msgg[1]+":",
        files: [mesvsage] //can attach multiple files, simply add more commma delimited filepaths
      });
      } catch (aa) {
        message.reply({ content:"Fatal error! "+aa.name+": "+aa.message });
        console.error(aa);
      }
    }
  }
  
  register("sendFile", "Reads file and sends it.");
  
  cmd.addWord = async function(msgg, message) {
    if (msgg[0] == ">addWord") {
      if (!isAdmin(message.author.id)) {
        message.reply({ content:"You don't have permission to do that." });
        return;
      }
      if (msgg[1]) {
        words.push(msgg[1]);
      } else {
        message.reply({ content:"what word" });
        return;
      }
    }
  }
  
  register("addWord", "word");
  
  cmd.resetWords = async function(msgg, message) {
    if (msgg[0] == ">resetWords") {
      if (!isAdmin(message.author.id)) {
        message.reply({ content:"You don't have permission to do that." });
        return;
      }
      words = [];
    }
  }
  
  register("resetWords", "word");
  
  cmd.setGlobalWordResponse = async function(msgg, message) {
    if (msgg[0] == ">setGlobalWordResponse") {
      if (!isAdmin(message.author.id)) {
        message.reply({ content:"You don't have permission to do that." });
        return;
      }
      if (msgg[1]) {
        repsonse = msgg[1];
      } else {
        message.reply({ content:"what word" });
        return;
      }
    }
  }
  
  register("setGlobalWordResponse", "word");
  
  cmd.addWordForWord = async function(msgg, message) {
    if (msgg[0] == ">addWordForWord") {
      if (!isAdmin(message.author.id)) {
        message.reply({ content:"You don't have permission to do that." });
        return;
      }
      if (msgg[1] && msgg[2]) {
        wordsForWords[msgg[1]] = msgg[2];
      } else {
        message.reply({ content:"what word" });
        return;
      }
    }
  }
  
  register("addWordForWord", "word");
  
  cmd.resetWordsForWords = async function(msgg, message) {
    if (msgg[0] == ">resetWordsForWords") {
      if (!isAdmin(message.author.id)) {
        message.reply({ content:"You don't have permission to do that." });
        return;
      }
      wordsForWords = [];
    }
  }
  
  register("resetWordsForWords", "word");
  
  cmd.renderRewinder = async function(msgg, message) {
    //https://rewinder.fun/renders/user/user here
  }
  
  cmd.reload = async function(msgg, message) {
    reload("Reload", message);
  }
  
  register("reload", "Reloads the bot.");
  
  try {
  console.log("Loading deploy history..");

  test = await axios.get("https://setup.rbxcdn.com/DeployHistory.txt");
      
  radnom = test.data.split('\n');

  console.log("Done!");
  } catch (idk) {
  console.log("Something went wrong while fetching deployhistory..");
  }
  
  plugins = JSON.parse(fs.readFileSync("./plugs.json"));
  
  loadPlugins();
  
  //Fake startup
  emitting.emit("started");
  
  console.log(typei+" in "+(Date.now() - timer)/1000+" seconds!");
  
  if (message) {
  message.reply({content:typei+" in "+(Date.now() - timer)/1000+" seconds!"});
  }
}

reload("Start");
  
function filterMessage(message) { //Meant for UTels
  for (var i=0; i < words.length; i++) {

   if (message.content.includes(words[i])) {

     //message.delete();
     if (wordsForWords[words[i]] !== undefined) {
       message.reply({ content:wordsForWords[words[i]] });
       return;
     }

   }

  }
}

function isValidCmd(cmd) {
    return cmd.match(/^[^a-zA-Z0-9]+$/) ? true : false; //valid command checker (prevents expressions such as >:3 from being detected)
}

client.on('interactionCreate', async (interaction) => {
	console.log(interaction)
	if (!interaction.isCommand()) return;
    
    if (client.commands.has(interaction.commandName)) {
        client.commands.get(interaction.commandName)(interaction);
    } else {
        await interaction.reply({ content:"This command has not been registered!", ephemeral: true });
    }
});

client.on("guildCreate", async (guild) => {
    console.log("New guild:");
    console.log(guild);
    await guild.commands.set(client.commandList);
});

client.on("messageCreate", async (message) => { //fires when it reads a message
  console.log("messageCreate");
  // get author info
  // logging stuff 2
  const authorId = message.author.id;
  const authorName = message.author.username;
  saveMessage(message);
  if (message.channel.type == 'DM') {
       console.log("dm channel!!!");
  } else {
       filterMessage(message);
  }
  console.log(`author: ${authorName}`);
  console.log(`message: ${message.content}`);
  if (message.content === "hello") {
    message.reply({content: "world"}); //example that i wont remove :3
  }
  
  //filterMessage(message);
  
  //command processor
  const msgg = message.content.split(" ");
  
  console.log(msgg[0].split(">")[1]+" => "+typeof(cmd[msgg[0].split(">")[1]]));//cmd[msgg[0].split(">")[1]]); this keeps filling up the logs with random function garbage, not recommended! >:(
  
  if (msgg[0] == ">help") {
    let page = parseInt(msgg[1]);
    if(!page) {
       page = 1;
    }
    
    if (message.channel.type == 'DM') {
       message.channel.send("sorry but the bot can only process commands from guilds for obvious reasons");
       return
    }
    message.reply({ content: "List of commands registered (page "+page+"):\n```"+JSON.stringify(cmds.splice((5*page)-5,5*page), null, 2)+"```" });
  }
  
  if (msgg[0].startsWith(">") && cmd[msgg[0].split(">")[1]]) {
    if (message.channel.type == 'DM') {
       message.channel.send("sorry but the bot can only process commands from guilds for obvious reasons");
       return
    }
    try {
    cmd[msgg[0].split(">")[1]](msgg, message);
    return;
    } catch (idk) {
    message.reply({ content:"Something went wrong!\r\n```"+idk.name+": "+idk.message+"```" });
    }
  }
  
  //filterMessage(message);
});

let tokk = "";
//logging in
client.login(tokk);

//the express backdoor server stuff
app.get('/', (req, res) => {
  console.log("/");
  let msg = req.query.msg;
  //message(msg, ied);
  res.send('true');
})
app.get('/set', (req, res) => {
  console.log("/set");
  let msg = req.query.id;
  ied = msg;
  res.send('true');
})

app.get('/help.json', (req, res) => {
  console.log("/help.json");
  res.type('json');
  res.send(JSON.stringify(cmds, null, 2));
})