const conf = require('./config.json')
const tmi = require('tmi.js');
const fetch = require('node-fetch');
const sound = require('sound-play');
const fs = require('fs');

const client = new tmi.Client({
	options: { debug: false },
	connection: {
		secure: true,
		reconnect: true
	},
	identity: {
		username: conf.username,
		password: conf.token
	},
	channels: conf.channels
});

// Register our event handlers (defined below)
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

client.connect();

//fazer um contato de erros para evidencias erradas
const absolute_path = conf.absolute_path;
const ghost_information = conf.ghost_information;
const ghosts = conf.ghosts;
const ghost_evidence = conf.ghost_evidence;

var evidences_found = ['', '', ''];

const ghost_types = [
    [ghosts[0],	ghost_evidence[2], ghost_evidence[3], ghost_evidence[5]],
    [ghosts[1],	ghost_evidence[2], ghost_evidence[3], ghost_evidence[6]],
    [ghosts[2],	ghost_evidence[1], ghost_evidence[4], ghost_evidence[6]],
    [ghosts[3], ghost_evidence[2], ghost_evidence[3], ghost_evidence[4]],
    [ghosts[4],	ghost_evidence[1], ghost_evidence[3], ghost_evidence[6]], 
    [ghosts[5],	ghost_evidence[1], ghost_evidence[2], ghost_evidence[4]],
    [ghosts[6],	ghost_evidence[2], ghost_evidence[4], ghost_evidence[6]],
    [ghosts[7],	ghost_evidence[1], ghost_evidence[3], ghost_evidence[5]],
    [ghosts[8],	ghost_evidence[1], ghost_evidence[4], ghost_evidence[5]],
    [ghosts[9],	ghost_evidence[2], ghost_evidence[5], ghost_evidence[6]],
    [ghosts[10], ghost_evidence[4], ghost_evidence[5], ghost_evidence[6]],
    [ghosts[11], ghost_evidence[1], ghost_evidence[2], ghost_evidence[5]],
];

/* Id for each evidence
1 - EMF 5
2 - Spirit Box
3 - Fingerprints
4 - Ghost Orbs
5 - Ghost Writing
6 - Freezing Temps
*/

// Called every time a message comes in
function onMessageHandler (target, user, msg, self) {
	if (self) { return; } // Ignore messages from the bot

	// Remove whitespace from chat message
	const commandName = msg.trim();

	switch(commandName){
		case '!botcommands':
			client.say(target, 'The commands that you can use are: '+
				'!mustang_san, '+
				'!inspirationalQuotes, '+
				'!dadjoke, '+
				'!+thoughts, '+
				'!imbored, '+
				'!phasmo, '+
				'!math, '+
				'!hug Name'
			);
			//console.log(`* Executed ${commandName} command`);
			break;
		case '!mustang_san':
			client.say(target, 'The name Mustang San came from his love for the Ford Mustang, and because of Roy Mustang from FullMetal Alchemist!');
			//console.log(`* Executed ${commandName} command`);
			break;
		case '!dice':
			const num = rollDice();
			client.say(target, `You rolled a ${num}`);
			//console.log(`* Executed ${commandName} command`);
			break;
		case '!inspirationalQuotes':
			sayQuote(target);
			//console.log(`* Executed ${commandName} command`);
			break;
		case '!dadjoke':
			sayDatDadJoke(target);
			//console.log(`* Executed ${commandName} command`);
			break;
		case '!+thoughts':
			sayPossitivetToughts(target);
			//console.log(`* Executed ${commandName} command`);
			break;
		case '!imbored':
			helpFightBoredom(target);
			//console.log(`* Executed ${commandName} command`);
			break;
		case '!hunt_info':
			setTimeout(function(){iteration(target)}, 500)
			//console.log(`* Executed ${commandName} command`);
			break;
		case '!ghost_type':
			client.say(target, "The Ghosts Types in Phasmophobia are: " + ghosts.join(', '));
			//console.log(`* Executed ${commandName} command`);
			break;
		case '!phasmo':
			client.say(target, 'You can use the commands !hunt_info, !ghostType, !info GhostType, !strength GhostType, !weakness GhostType');
			//console.log(`* Executed ${commandName} command`);
			break;
		case '!math':
			client.say(target, 'You can use the commands !simplify expression, !factor expression, !derive expression, !integrate expression');
			//console.log(`* Executed ${commandName} command`);
			break;
		/*case '!playsound':
			sound.play(absolute_path+'file.mp3');
			//console.log(`* Executed ${commandName} command`);
			break;*/
		
		default:
			if(commandName.indexOf("!hug") !== -1){
				let user1 = user['display-name'];
				let user2 = commandName.slice(4);

				let hugs = 0;

				hugs = fs.readFileSync(absolute_path+'hugs.txt', 'utf8');

				hugs++
				fs.writeFile(absolute_path+'hugs.txt', hugs.toString(), function (err) {
				});

				client.say(target, `${user1} hugged ${user2}. ${hugs} hugs was given in this channel`);
				////console.log(`* Evidence 3: ${ev3}`);
			}

			if(commandName.split(" ")[0] === "!info") {
				let ghost = commandName.split(" ")[1];
				ghost_information.forEach(element => {
		            if (element.includes(ghost)) {
		                let info = element[1];
						client.action(target, `Info: ${info}`);
		            } 
		        });
			}
			if(commandName.split(" ")[0] === "!strength") {
				let ghost = commandName.split(" ")[1];
				ghost_information.forEach(element => {
		            if (element.includes(ghost)) {
		                let info = element[2];
						client.action(target, `${info}`);
		            } 
		        });
			}
			if(commandName.split(" ")[0] === "!weakness") {
				let ghost = commandName.split(" ")[1];
				ghost_information.forEach(element => {
		            if (element.includes(ghost)) {
		                let info = element[3];
						client.action(target, `${info}`);
		            } 
		        });
			}
			
			if(commandName.split(" ")[0] === "!simplify") {
				let expression = commandName.split(" ")[1];
				doSomeMath(target, "simplify", encodeURIComponent(expression));
			}
			if(commandName.split(" ")[0] === "!factor") {
				let expression = commandName.split(" ")[1];
				doSomeMath(target, "factor", encodeURIComponent(expression));
			}
			if(commandName.split(" ")[0] === "!derive") {
				let expression = commandName.split(" ")[1];
				doSomeMath(target, "derive", encodeURIComponent(expression));
			}
			if(commandName.split(" ")[0] === "!integrate") {
				let expression = commandName.split(" ")[1];
				doSomeMath(target, "integrate", encodeURIComponent(expression));
			}

			//Only mods and streamer can use the functions for phasmo overley
			if(user['mod'] || conf.channels.includes('#'+user['username'])){
				/* if(commandName.split(" ")[0] == "!so"){
				 	let shoutout_name = commandName.slice(4);
					client.say(target, `Check it outs this awersome streamer ${shoutout_name}`);
				} */ 
				if(commandName.split(" ")[0] === "!ghost"){
					let ghost_name = commandName.slice(7);
					if(ghost_name == ''){
						client.say(target, `You need to actually give me a name ¬¬`);	
					}else{
						client.say(target, `We are being hunted by ${ghost_name}`);
						
						fs.writeFile(absolute_path+'overlayPhasmo\\ghost_name.txt', ghost_name, function (err) {
						    //console.log('Its saved!');
						});
					}
					//console.log(`* Ghost Name: ${ghost_name}`);
				} else if(commandName.split(" ")[0] === "!ev1"){
					let ev_id = commandName.split(" ")[1];
					let ev1 = ghost_evidence[ev_id];

					evidences_found[0] = ev1;
        			setTimeout(function(){iteration(target)}, 500)
					
					//client.say(target, `We are being hunted by ${ev1}`);
					fs.writeFile(absolute_path+'overlayPhasmo\\evidence_1.txt', 'E1: '+ev1, function (err) {
					    //console.log('Its saved!');
					});
					//console.log(`* Evidence 1: ${ev1}`);
				} else if(commandName.split(" ")[0] === "!ev2"){
					let ev_id = commandName.split(" ")[1];
					let ev2 = ghost_evidence[ev_id];

					evidences_found[1] = ev2;
        			setTimeout(function(){iteration(target)}, 500)
					
					//client.say(target, `We are being hunted by ${ev2}`);
					fs.writeFile(absolute_path+'overlayPhasmo\\evidence_2.txt', 'E2: '+ev2, function (err) {
					    //console.log('Its saved!');
					});
					//console.log(`* Evidence 2: ${ev2}`);
				} else if(commandName.split(" ")[0] === "!ev3"){
					let ev_id = commandName.split(" ")[1];
					let ev3 = ghost_evidence[ev_id];

					evidences_found[2] = ev3;
        			setTimeout(function(){iteration(target)}, 500)

					//client.say(target, `We are being hunted by ${ev3}`);
					fs.writeFile(absolute_path+'overlayPhasmo\\evidence_3.txt', 'E3: '+ev3, function (err) {
					    //console.log('Its saved!');
					});
					//console.log(`* Evidence 3: ${ev3}`);
				} else if(commandName.indexOf("!clean") !== -1){
					evidences_found[0] = '';
					evidences_found[1] = '';
					evidences_found[2] = '';
					fs.writeFile(absolute_path+'overlayPhasmo\\ghost_name.txt', '', function (err) {
					    //console.log('Its saved!');
					});
					fs.writeFile(absolute_path+'overlayPhasmo\\evidence_1.txt', 'E1:', function (err) {
					    //console.log('Its saved!');
					});
					fs.writeFile(absolute_path+'overlayPhasmo\\evidence_2.txt', 'E2:', function (err) {
					    //console.log('Its saved!');
					});
					fs.writeFile(absolute_path+'overlayPhasmo\\evidence_3.txt', 'E3:', function (err) {
					    //console.log('Its saved!');
					});
				}
			}

			
			break;
	}
}

function doSomeMath(target,operation,expression){
	fetch("https://newton.now.sh/api/v2/"+operation+"/"+expression)
		.then(response => response.json())
		.then(data => {
			console.log(data);
			let expression = data.expression;
			let result = data.result;
			client.say(target, `${expression} = ${result}`);
		});
}

function sayQuote(target) {
	fetch("https://type.fit/api/quotes")
		.then(response => response.json())
		.then(data => {
			let quote_number = Math.floor(Math.random() * data.length) + 1;
			let quote = data[quote_number].text + ' By ' + data[quote_number].author;
			client.say(target, `${quote}`);
		});
}

function sayDatDadJoke(target) {
	fetch("https://icanhazdadjoke.com/", {
			headers: {
				Accept: "application/json"
			}
		})
		.then(response => response.json())
		.then(data => {
			//console.log(data);
			let joke = data.joke;
			client.say(target, `${joke}`);
		});
}

function sayPossitivetToughts(target) {
	fetch("https://www.affirmations.dev/")
		.then(response => response.json())
		.then(data => {
			//console.log(data);
			let affirmation = data.affirmation;
			client.say(target, `${affirmation}`);
		});
}

function helpFightBoredom(target) {
	fetch("http://www.boredapi.com/api/activity/")
		.then(response => response.json())
		.then(data => {
			//console.log(data);
			let activity = data.activity;
			client.say(target, `${activity}`);
		});
}

function rollDice () {
	const sides = 6;
	return Math.floor(Math.random() * sides) + 1;
}

function iteration(target){
    let ghost_ev = [];
    let possible_evs = [];
    if (evidences_found[0] != '' && evidences_found[1] != '' && evidences_found[2] != '') {
        let buffer = []
        //console.log('three evidences')
        ghost_types.forEach(element => {
            if (element.includes(evidences_found[0]) && element.includes(evidences_found[1]) && element.includes(evidences_found[2])) {
                buffer.push(element[0]);
                ghost_ev.push([element[1],element[2],element[3]]);
            } 
        });
        //console.log(buffer)
        if(buffer.length == 0){
        	client.say(target, "Yeah, One of those evidences is wrong buddy!");
        } else{
        	client.say(target, "We are being hunted by: " + buffer);
        }
    } else if (evidences_found[0] != '' && evidences_found[1] != '') {
        let buffer = [];
        //console.log('two evidences')
        ghost_types.forEach(element => {
            if (element.includes(evidences_found[0]) && element.includes(evidences_found[1])) {
	    		let possible_evs = element.filter(x => (!evidences_found.includes(x) && x !== element[0]));
                buffer.push(element[0]+' ['+possible_evs[0]+']');
            }
        });

        //console.log(buffer)
        client.say(target, "We may be being hunted by: " + buffer.join(', '));
    } else if (evidences_found[0] != '') {
        let buffer = [];
        //console.log('one evidence')
        ghost_types.forEach(element => {
            if (element.includes(evidences_found[0])) {
                buffer.push(element[0]);
                ghost_ev.push([element[1],element[2],element[3]]);
            } 
        });
        //console.log(buffer)
        client.say(target, "We may be being hunted by: " + buffer.join(', '));
    } else{
    	client.say(target, "We dont have any information yet!");
    }
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler (addr, port) {
	//client.action('name_of_the_channel', "Name of the Channel is now live! Come hang out!!!");
	console.log(`* Connected to ${addr}:${port}`);
}