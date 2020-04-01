const Discord = require('discord.js');
const prefix = "*";
// const { token, geniusToken, ytAPIToken } = require("./tokens.json");
const token = process.env.token;
const geniusToken = process.env.geniusToken;
const ytAPIToken =  process.env.ytAPIToken;

const ytdl = require('ytdl-core');
const genius = require("genius-lyrics");
const Genius = new genius.Client(geniusToken);
const ytSearch = require('youtube-search');
const ping = require('ping');

const opts = {
	maxResults: 1,
	key: ytAPIToken,
	type: 'video',
	videoCategoryId: '10'
}

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
	} else if (message.content.startsWith(`${prefix}skip`)) {
		skip(message, serverQueue);
		return;
	} else if (message.content.startsWith(`${prefix}stop`)) {
		stop(message, serverQueue);
		return;
	} else if (message.content.startsWith(`${prefix}join`)) {
		join(message);
		return;
	} else if (message.content.startsWith(`${prefix}disconnect`)) {
		disconnect(message);
		return;
	} else if (message.content.startsWith(`${prefix}pause`)) {
		pause(message, serverQueue);
		return;
	} else if (message.content.startsWith(`${prefix}resume`)) {
		resume(message, serverQueue);
		return;
	} else if (message.content.startsWith(`${prefix}status`)) {
		status(message, serverQueue);
		return;
	} else if (message.content.startsWith(`${prefix}lyrics`)) {
		lyrics(message, serverQueue);
		return;
	} else if (message.content.startsWith(`${prefix}spit-harder`)) {
		spit_hardly(message);
		return;
	} else if (message.content.startsWith(`${prefix}spit`)) {
		spit(message);
		return;
	} else if (message.content.startsWith(`${prefix}help`)) {
		help(message);
		return;
	} else if (message.content.startsWith(`${prefix}ping`)) {
		pingini(message);
		return;
	} else {
		message.channel.send("\:no_entry: You need to enter a valid command!");
	}
})

const queue = new Map();

function getPos(position) {
	if (position % 10 === 1)
		return position + 'st'
	else if (position % 10 === 2)
		return position + 'nd'
	else if (position % 10 === 3)
		return position + 'rd'
	else
		return position + 'th'
}

async function execute(message, serverQueue) {
	const args = message.content.split(" ");

	if (!args[1]) {
		console.log("No argument provided.."); return ;
	}

	var videoURL = args[1];

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
	{
		let query = message.content.substr(6, message.content.length - 6);
		let prom = await ytSearch(query, opts)
		if (prom.results.length === 0) return message.channel.send(`\:no_entry: Couldn't find any Youtube music video called: **${query}**`)
		videoURL = prom.results[0].link;
	}

	try {
		ytdl.getURLVideoID(videoURL)
	} catch (err) {
		console.log(err)
	}

	const songInfo = await ytdl.getInfo(videoURL);

	const song = {
		id: songInfo.video_id,
		title: songInfo.title,
		url: songInfo.video_url,
	};

	if (!serverQueue) {
	} else {
		serverQueue.songs.push(song);
		const reply = new Discord.MessageEmbed()
		.setColor('#0099ff')
		.setTitle(song.title)
		.setURL(song.url)
		.setDescription('Song added to the queue!')
		.setThumbnail('https://img.youtube.com/vi/'+song.id+'/0.jpg')
		.addField('Position', getPos(serverQueue.songs.length))
		.setTimestamp()
		.setFooter('Holkify', 'https://i.imgur.com/XDkcxLZ.png');
		return message.channel.send(reply);
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
		return message.channel.send(
			"I joined your voice channel !"
		);
	} catch (err) {
		console.log(err)
	}
}

function disconnect(message) {
	try {
		message.member.voice.channel.leave();
	} catch (err) {
		console.log(err)
	}
	queue.delete(message.guild.id);
	return message.channel.send(
		"I left your voice channel !"
	);
}

function spit(message) {
	const glitch = message.guild.emojis.cache.get("694322315185487963");
	return message.channel.send(`${glitch}`);
}

function spit_hardly(message) {
	const glitch = message.guild.emojis.cache.get("694543544932892713");
	return message.channel.send(`${glitch}`);
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
	const reply = new Discord.MessageEmbed()
	.setColor('#0099ff')
	.setTitle(song.title)
	.setURL(song.url)
	.setDescription('Now playing..')
	.setThumbnail('https://img.youtube.com/vi/'+song.id+'/0.jpg')
	.setTimestamp()
	.setFooter('Holkify', 'https://i.imgur.com/XDkcxLZ.png');
	return serverQueue.textChannel.send(reply);
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

function status(message, serverQueue) {
	if (serverQueue) {
		const reply = new Discord.MessageEmbed()
		.setColor('#0099ff')
		.setTitle('Queue status:')
		.addField('Now playing:', serverQueue.songs[0].title)
		if (serverQueue.songs[1])
			reply.addField('Next:', serverQueue.songs[1].title)
		if (serverQueue.songs[2])
			reply.addField('Later:', serverQueue.songs[2].title)
		reply.setTimestamp()
		.setFooter('Holkify', 'https://i.imgur.com/XDkcxLZ.png');
		return serverQueue.textChannel.send(reply);
	} else {
		message.channel.send(`\:no_entry: No song is playing !`);
	}
}

function sendLyrics(channel, lyrics) {
	let i = 0;
	let len = lyrics.length

	if (len <= 1990)
		return channel.send("\:musical_note: Lyrics:\n\n"+lyrics);
	else {
		channel.send("\:musical_note: Lyrics:\n\n");
		while (i <= len) {
			channel.send(lyrics.substr(i, 1990));
			i += 1990;
		}
	}
	return ;
}

async function lyrics(message, serverQueue) {
	if (serverQueue){

		const title = encodeURI(serverQueue.songs[0].title);
		const search = await Genius.findTrack(title);
		if (search.response.hits.length === 0) {
			return spit(message);
		}
		const url = await Genius.getUrl(search);
		const lyricsJSON = await Genius.getLyrics(url);
		const lyrics = lyricsJSON.lyrics;
		return sendLyrics(message.channel, lyrics);
	} else {
		return message.channel.send("\:no_entry: No song is playing ..");
	}
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
	if (!serverQueue) return message.channel.send('\:no_entry: No song is playing!')
	let song = serverQueue.songs[0];
	if (!message.member.voice.channel)
		return message.channel.send(
			"\:cry: You have to be in a voice channel to stop the music!"
	);
	serverQueue.connection.dispatcher.pause();
	serverQueue.playing = false;
	const reply = new Discord.MessageEmbed()
	.setColor('#0099ff')
	.setTitle(song.title)
	.setURL(song.url)
	.setDescription('Paused !')
	.setThumbnail('https://img.youtube.com/vi/'+song.id+'/0.jpg')
	.setTimestamp()
	.setFooter('Holkify', 'https://i.imgur.com/XDkcxLZ.png');
	return serverQueue.textChannel.send(reply);
	return message.channel.send(" \:pause_button: Paused!");
}

function resume(message, serverQueue) {
	if (!serverQueue) return message.channel.send('\:no_entry: No song is playing!')
	let song = serverQueue.songs[0]
	if (!message.member.voice.channel)
		return message.channel.send(
			"\:cry: You have to be in a voice channel to stop the music!"
	);
	serverQueue.connection.dispatcher.resume();
	const reply = new Discord.MessageEmbed()
	.setColor('#0099ff')
	.setTitle(song.title)
	.setURL(song.url)
	.setDescription('Resuming ..')
	.setThumbnail('https://img.youtube.com/vi/'+song.id+'/0.jpg')
	.setTimestamp()
	.setFooter('Holkify', 'https://i.imgur.com/XDkcxLZ.png');
	return serverQueue.textChannel.send(reply);
	return message.channel.send("\:arrow_forward: Resuming..");
}

function help(message) {
	const reply = new Discord.MessageEmbed()
	.setColor('#0099ff')
	.setTitle('Holkify commands')
	.setDescription('Here what you can do with Holkify:')
	.addFields(
		{ name: '*join', value: 'Summon the bot to the voice channel you are connected to.' },
		{ name: '*play <Youtube URL>', value: 'Plays the audio from the link provided or adds it to the queue.' },
		{ name: '*play <Song name>', value: 'Search for the song in Youtube and plays the audio or adds it to the queue' },
		{ name: '*pause', value: 'Pauses playing the song.' },
		{ name: '*resume', value: 'Resume playing the song.' },
		{ name: '*skip', value: 'Skips to the next song in the queue' },
		{ name: '*stop', value: 'Stop playing the music and automatically leaves your voice channel.' },
		{ name: '*status', value: 'Gives the queue\'s status.' },
		{ name: '*status', value: 'Gives the queue\'s status.' },
		{ name: '*lyrics', value: 'Fetch for the lyrics of the current song on Genius, and shows them, spits if found nothing.' },
		{ name: '*spit', value: 'Spits at you, use this for testing the bot response.' },
		{ name: '*disconnect', value: 'Leaves your voice channel.' },
		{ name: '*help', value: 'Shows the Holkify commands.' }
	)
	.setTimestamp()
	.setFooter('Holkify', 'https://i.imgur.com/XDkcxLZ.png');
	return message.channel.send(reply);
}

function pingini(message) {
	ping.promise.probe('www.youtube.com')
	.then(function (res) {
		if (res.alive === false) return message.channel.send("\:no_entry: Request timeout.")
		const reply = new Discord.MessageEmbed()
		.setColor('#0099ff')
		.setTitle('Pinging Youtube servers ..')
		.setDescription(res.time + ' ms')
		.setTimestamp()
		.setFooter('Holkify', 'https://i.imgur.com/XDkcxLZ.png');
		return message.channel.send(reply);
	});
}

client.login(token);