const Discord = require('discord.js');
const prefix = "*";
const token = process.env.token;
const ytdl = require('ytdl-core');


const client = new Discord.Client();

client.once('ready', () => {
	console.log('Ready!');
});
client.once('reconnecting', () => {
	console.log('Reconnecting!');
});
client.once('disconnect', () => {
	console.log('Disconnect!');
});

client.on('message', async message => {
	if (message.author.bot) return;
	if (!message.content.startsWith(prefix)) return;
	if (message.channel.id != "693551208387838012") return ;

	const serverQueue = queue.get(message.guild.id);


	if (message.content.startsWith(`${prefix}play`)) {
		execute(message, serverQueue);
		return;
	} else if (message.content.startsWith(`${prefix}skip `)) {
		skip(message, serverQueue);
		return;
	} else if (message.content.startsWith(`${prefix}stop `)) {
		stop(message, serverQueue);
		return;
	} else if (message.content.startsWith(`${prefix}join `)) {
		join(message);
		return;
	} else if (message.content.startsWith(`${prefix}disconnect `)) {
		disconnect(message.guild);
		return;
	} else if (message.content.startsWith(`${prefix}pause `)) {
		pause(message, serverQueue);
		return;
	} else if (message.content.startsWith(`${prefix}resume `)) {
		resume(message, serverQueue);
		return;
	} else {
		message.channel.send("\:no_entry: You need to enter a valid command!");
	}
})

const queue = new Map();

async function execute(message, serverQueue) {
	const args = message.content.split(" ");

	if (!args[1]) {
		console.log("No argument provided.."); return ;
	}

	const voiceChannel = message.member.voice.channel;
	if (!voiceChannel)
		return message.channel.send(
		"You need to be in a voice channel to play music!"
		);
	const permissions = voiceChannel.permissionsFor(message.client.user);
	if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
		return message.channel.send(
		"\:pleading_face: I need the permissions to join and speak in your voice channel!"
		);
	}

	if (await ytdl.validateURL(args[1]) !== true)
	return message.channel.send(
		"\:no_entry: Unvalid youtube URL!"
		);

	try {
		ytdl.getURLVideoID(args[1])
	} catch (err) {
		console.log(err)
	}

	const songInfo = await ytdl.getInfo(args[1]);

	const song = {
		title: songInfo.title,
		url: songInfo.video_url,
	};

	if (!serverQueue) {

	} else {
		serverQueue.songs.push(song);
		return message.channel.send(`${song.title} has been added to the queue!`);
	}
	// Creating the contract for our queue
	const queueContract = {
		textChannel: message.channel,
		voiceChannel: voiceChannel,
		connection: null,
		songs: [],
		volume: 5,
		playing: true,
	};
	// Setting the queue using our contract
	queue.set(message.guild.id, queueContract);
	// Pushing the song to our songs array
	queueContract.songs.push(song);

	try {
		// Here we try to join the voicechat and save our connection into our object.
		var connection = await voiceChannel.join();
		queueContract.connection = connection;
		// Calling the play function to start a song
		play(message.guild, queueContract.songs[0]);
	} catch (err) {
		// Printing the error message if the bot fails to join the voicechat
		console.log(err);
		queue.delete(message.guild.id);
		return message.channel.send(err);
	}
}

function join(message) {
	const voiceChannel = message.member.voice.channel;
	if (!voiceChannel)
		return message.channel.send(
		"\:no_entry: You need to be in a voice channel!"
	);
	const permissions = voiceChannel.permissionsFor(message.client.user);
	if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
		return message.channel.send(
		"\:pleading_face: I need the permissions to join and speak in your voice channel!"
		);
	}
	try {
		voiceChannel.join();
	} catch (err) {
		console.log(err)
	}
}

function disconnect(guild) {
	const serverQueue = queue.get(guild.id);
	serverQueue.voiceChannel.leave();
	queue.delete(guild.id);
}


function play(guild, song) {
	const serverQueue = queue.get(guild.id);
	if (!song) {
	  serverQueue.voiceChannel.leave();
	  queue.delete(guild.id);
	  return;
	}

	const dispatcher = serverQueue.connection.play(ytdl(song.url, {quality: 'highest', liveBuffer: 100000})).on("finish", () => {
		serverQueue.songs.shift();
		play(guild, serverQueue.songs[0]);
	}).on("error", error => console.error(error));
	dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
	serverQueue.textChannel.send(`\:arrow_forward: Start playing: **${song.title}**`);
}

function skip(message, serverQueue) {
	if (!message.member.voice.channel)
		return message.channel.send(
			"\:cry: You have to be in a voice channel to stop the music!"
	);
	if (!serverQueue)
		return message.channel.send("\:no_entry: There is no song that I could skip!");
	serverQueue.connection.dispatcher.end();
	return message.channel.send("\:fast_forward: Skipping to next song..");
}

function stop(message, serverQueue) {
	if (!message.member.voice.channel)
		return message.channel.send(
			"\:cry: You have to be in a voice channel to stop the music!"
	);
	serverQueue.songs = [];
	serverQueue.connection.dispatcher.end();
	return message.channel.send("\:stop_button: I've stopped playing music!");
}

function pause(message, serverQueue) {
	if (!message.member.voice.channel)
		return message.channel.send(
			"\:cry: You have to be in a voice channel to stop the music!"
	);
	serverQueue.connection.dispatcher.pause();
	return message.channel.send(" \:pause_button: Paused!");
}

function resume(message, serverQueue) {
	if (!message.member.voice.channel)
		return message.channel.send(
			"\:cry: You have to be in a voice channel to stop the music!"
	);
	serverQueue.connection.dispatcher.resume();
	return message.channel.send("\:arrow_forward: Resuming..");
}

client.login(token);