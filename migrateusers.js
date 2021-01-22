//Grab users of a Role and add them to another Role 
//Usefull for User Data Migration of sorts


//Server Config Area
var Rolestomigratefrom = "539232227360243712"; //Names of Roles to move away from
var RolestoMigrateto = "795078191504556143"
var Servertocheck = "539232227360243712" //Server ID to migrate
var Loglevel = "debug" //error: 0,  warn: 1,  info: 2,  http: 3,  verbose: 4,  debug: 5,  silly: 6 - always displays selected level and lower

//req's
var Discord = require('discord.io'); //Discord API Library - not too current but works
var winston = require('winston'); //Logger Lib
var auth = require('./auth.json');//Discord Bot Token

//Init Vars for use later

var AllUsers;

const { combine, timestamp, label, printf } = winston.format;
const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
}); 
 
const logger = winston.createLogger({
  level: 'debug',
  format: combine(
    label({ label: process.env.COMPUTERNAME }),
    timestamp(),
    myFormat
  ),

  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
	new winston.transports.File({ filename: 'Log.log'}),
    new winston.transports.File({ filename: 'Debug.log', level: 'silly' }),
	new winston.transports.Console({ level: 'info', 'timestamp':true, colorize: true}),
  ],
});


// Initialize Discord Bot
var bot = new Discord.Client({
	token: auth.token,
	autorun: true
});

bot.on('ready', function (evt) {
	logger.info('Connected, Bot ready');
    logger.info('Logged in as: ' + bot.username + ' - (' + bot.id + ')');
	bot.getAllUsers();
	var input = {
		limit: 99999,
	}
	bot.getMembers(input);

		
	//Build Arrays with protecteduser info, called all 10 minutes (will need top include some type of "running" indicator to prevent other code from running until rebuild finished)
	setTimeout(() => Getalluserdataandbuildarrays(), 320000);

});

//Event to fire if bots Disconencts (fix for stopping bot after certain amount of hours)
bot.on('disconnect', (msg, code) => {
    if (code === 0) return console.error(msg);
    bot.connect();
});





function sendembed_basic(channelID, color, titlestr, description, Footertext){
	 bot.sendMessage({ to:channelID,
			   embed: {
				  color: color,
				  title: titlestr,
				  description: description,
				  thumbnail: {
					  url: ""
				  },
				  footer: {
					  text: Footertext,
					},
				}
			});
}



function Getalluserdataandbuildarrays(){
		logger.silly("API Call bot.getAllUsers();")
	bot.getAllUsers();
	
	logger.silly("Servers : " + bot.servers);	
	//Grab all Users we know of on the Server to protect
	//Force Cache to update by grabbing all users explicitly
	var input = {
		limit: 99999,
	}
	 setTimeout(() =>  bot.getMembers(input), 2500);


	//overwrite current userarray
	AllUserstmp = bot.servers[Servertocheck].members;
	//AllUsers = bot.users
	logger.silly("Users:")
	var usercount = 0;
	var tomigrate = [];
	for (var user in AllUserstmp) {
			tomigrate.push(bot.users[user].id)
		   usercount += 1;

	}
	
	 for (i = 0; i < tomigrate.length - 1; i++) {

					addtorole(tomigrate[i])
    }
	

	
	logger.info("User count Migrated: " + usercount);
	logger.info("Total Membercount: " + bot.servers[Servertocheck].member_count);
	logger.info("Finished migrating batch");

}
function addtorole(ID){
	  var memberroles = bot.servers[Servertocheck].members[ID].roles;
	 var alreadymigrated = false;
        for (var role in memberroles) {
            if (RolestoMigrateto == memberroles[role]) {
                alreadymigrated = true;
            }
        }
	if (!alreadymigrated){
							callbacklogger(ID)
		setTimeout(() =>  bot.addToRole({serverID: Servertocheck, userID: ID, roleID: RolestoMigrateto}),1000 + (i * 666));
	}else{
		//callbacklogger("no match")
	}
}
function callbacklogger(ID){
						setTimeout(() =>  logger.info(ID), 100 + (i * 666));
}