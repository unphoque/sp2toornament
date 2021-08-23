const secret_conf = require("./secret.json");

const Discord = require("discord.js");
var client = new Discord.Client();
client.setMaxListeners(1023);
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

const fs = require("fs");

var config = new Map();

var dirname = __dirname + "/config/";

fs.readdir(dirname, function(err, filenames) {
    if (err) throw err;
    filenames.forEach(function(filename) {
        fs.readFile(dirname + filename, "utf-8", function(err, content) {
            if (err) throw err;
            if (filename != "0.json") setConfig(filename, content);
        });
    });
});

function setConfig(filename, content) {
    config.set(filename.substring(0, filename.indexOf(".")), JSON.parse(content));
}

function editConfig(msg) {
    if (msg == null) {
        //do nothing
    } else if (msg.content.toLowerCase() == "!config") {
        //show config
        var tmp = config.get(msg.guild.id);
        var toorid = "";
        if (tmp.toornament.id != 1523895530663616512) toorid = tmp.toornament.id;
        var text =
            "General config:" +
            "\nLanguage: " +
            tmp.lang +
            "\n\nServer config:" +
            "\nCommands: " +
            msg.guild.channels.cache.get(tmp.guild.cmd) +
            "\nGroups category ID: " +
            tmp.guild.groups +
            "\nParticipant channel and message: " +
            msg.guild.channels.cache.get(tmp.guild.participant.channel) +
            " " +
            tmp.guild.participant.msg +
            "\nLeaders list channel and message: " +
            msg.guild.channels.cache.get(tmp.guild.leaders.channel) +
            " " +
            tmp.guild.leaders.msg +
            "\nLeader role" +
            msg.guild.roles.cache.get(tmp.guild.leaders.role) +
            "\n\nToornament Config:" +
            "\nID: " +
            toorid +
            "\nURL: <" +
            tmp.toornament.url +
            ">";
        ("");
        msg.channel.send(text);
    } else if (msg.content.includes("reset")) {
        //reset config
        fs.readFile(__dirname + "/config/0.json", "utf-8", function(err, content) {
            if (err) throw err;
            content = JSON.parse(content);
            content.guild.id = guild.id;
            content.guild.name = guild.name;
            content = JSON.stringify(content);
            fs.writeFile(__dirname + "/config/" + guild.id + ".json", content, err => {
                if (err) throw err;
                console.log("Reseted configuration for " + guild.name);
            });
        });
    } else if (msg.content.includes("help")) {
        //config help message
        var helptext =
            "```" +
            "\nDetails about !config:" +
            "\n!config: show config for this server" +
            "\n!config command <channel>: defines the <channel> were commands will be executed. <channel> must be mentionned." +
            "\n!config groups <category>: defines the Discord category were group channels will be created. <category> is the ID of the category." +
            "\n!config help: show this help." +
            "\n!config lang <lang>: language used for the bot messages. Supported languages: en,fr." +
            "\n!config leader role <role>: defines the <role> assigned to all leaders. <role> must be mentionned." +
            "\n!config organizer <role1> [role2|...]: defines the staff-only roles. All roles must be mentionned. If not defined, the staff (except admins) will not be able to access group channels." +
            "\n!config participant channel <channel>: defines the <channel> were participants will be displayed. <channel> must be mentionned." +
            "\n!config participant msg <message_id>: defines the message to update for displaying participants. Must be a message wrote by this bot (using !config for example)" +
            "\n!config toornament <url>: defines the Toornament ID used for this tournament." +
            "\n\nNote: this command is only executable by admins, in any channel." +
            "\n```";
        msg.channel.send(helptext);
    } else {
        if (msg.content.includes("command")) {
            config.get(msg.guild.id).guild.cmd = msg.mentions.channels.first().id;
            config.get(msg.guild.id).guild.log = msg.mentions.channels.first().id;
        } else if (msg.content.includes("lang")) {
            config.get(guild.id).lang = msg.content.toLowerCase().substring(13, 15);
        } else if (msg.content.includes("participant")) {
            if (msg.content.includes("channel"))
                config.get(
                    msg.guild.id
                ).guild.participant.channel = msg.mentions.channels.first().id;
            else if (msg.content.includes("msg"))
                config.get(msg.guild.id).guild.participant.msg = msg.content.split(
                    " "
                )[3];
        } else if (msg.content.includes("leader")) {
            if (msg.content.includes("channel"))
                config.get(
                    msg.guild.id
                ).guild.leaders.channel = msg.mentions.channels.first().id;
            else if (msg.content.includes("msg"))
                config.get(msg.guild.id).guild.leaders.msg = msg.content.split(" ")[3];
            else if (msg.content.includes("role"))
                config.get(
                    msg.guild.id
                ).guild.leaders.role = msg.mentions.roles.first().id;
        } else if (msg.content.includes("organizer")) {
            var roles = msg.mentions.roles.array();
            var orga = [];
            for (var i = 0; i < roles.length; i++) {
                orga.push(roles[i].id);
            }
            config.get(msg.guild.id).guild.organizers = orga;
        } else if (
            msg.content.includes("toornament") ||
            msg.content.includes("tournament")
        ) {
            var url = msg.content.substring(msg.content.indexOf("https://"));
            if (url[url.length - 1] == ">") url[url.length - 1] = "";

            var id = msg.content.substring(url.lastIndexOf("/"));
            id = id.substring(0, id.indexOf("/"));
            console.log(id);
            try {
                var test = parseInt(id);
                test--;
            } catch (err) {
                log(msg.guild, "Error: URL cannot define current Toornament ID.");
            }
            var tmp = config.get(msg.guild.id);
            tmp.toornament.id = id;
            tmp.toornament.url = url;
            config.set(msg.guild.id, tmp);
        } else if (msg.content.includes("groups")) {
            try {
                var name = msg.content.substring(15);
                var undef = 1;
                try {
                    var c = msg.guild.channels.cache.get(name);
                    var tmp = config.get(msg.guild.id);
                    tmp.guild.groups = c.id;
                    config.set(msg.guild.id, tmp);
                    undef--;
                } catch (err) {
                    console.log(err);
                    var chan = msg.guilds.channels.array();

                    for (var c in chan) {
                        if (c.type == "category" && c.name == name) {
                            var tmp = config.get(msg.guild.id);
                            tmp.guild.groups = c.id;
                            config.set(msg.guild.id, tmp);
                            undef--;
                            break;
                        }
                    }
                }
                if (undef)
                    log(
                        msg.guild,
                        "Error: specified category doesn't match with existing category."
                    );
            } catch (err) {
                log(
                    msg.guild,
                    "Error: specified category name must not contains special characters. Try using category ID."
                );
            }
        }

        fs.writeFile(
            __dirname + "/config/" + msg.guild.id + ".json",
            JSON.stringify(config.get(msg.guild.id)),
            err => {
                if (err) throw err;
                log(msg.guild, "Config updated.");
            }
        );
    }
}

var guild;
var logChannel;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

//help function
function help(msg) {
    if (msg.content.substring(1) == "help")
        msg.channel.send(
            "Commands (prefix with ! or ?) :" +
            "\n```" +
            "\nendandreset : delete group roles and channels, remove ALPHA and BRAVO roles." +
            //'\n!give <roles> <members> : give all mentionned <roles> to all mentionned <members> (#cmd-bot)' +
            "\nhelp: display this help" +
            "\nkill <role>: remove mentionned role>" +
            "\nmakegr: create group roles and channels, with related permissions." +
            "\nsetgr: assign group roles to captains, must be used after !makegr." +
            "\nstart: send a general message in every group channel, must be used after !setgr" +
            "\n```"
        );
    else if (msg.content.includes("setgr"))
        msg.channel.send(
            "\n```" +
            "\n!setgr" +
            "\nsetgr assign group roles to captains using their group on Toornament." +
            "\nIt must be used after !makegr (when all channels are created)." +
            "\n\nMinor issues:" +
            "\n - It takes around 2 min 30 sec to assign roles to 100+ teams (150+ captains)" +
            "\n\nMajor issues:" +
            "\n - The group-1 role can't be assigned (for unknown reasons at this point)" +
            "\n\nImportant:" +
            "\nA captain nickname on Discord must be EXACTLY like 'team name - captain name'" +
            "\nIf the Discord team name is not the same as the registered one in Toornament, the role will not be assigned." +
            "\nPay a particular attention to special chars, they're the most common issue." +
            "\n```"
        );
}

//toornament GET function
function toornamentGet(data, range, guild, callback) {
    const req = new XMLHttpRequest();
    var url =
        "https://api.toornament.com/viewer/v2/tournaments/" +
        config.get(guild.id).toornament.id +
        "/" +
        data;
    req.open("GET", url);
    req.setRequestHeader("X-Api-Key", "" + secret_conf.TOORNAMENT_TOKEN);
    req.setRequestHeader("Range", data + "=" + range);
    req.addEventListener("load", function() {
        if (req.status < 200 && req.status >= 400)
            console.error(req.status + " " + req.statusText + " " + url);
    });
    req.addEventListener("error", function() {
        console.error("Error with URL " + url);
    });
    req.addEventListener("readystatechange", function() {
        if (req.readyState === 4) {
            callback(JSON.parse(req.responseText));
        }
    });
    req.send(null);
}

//retrieve participants
function getParticipants(range, msg, participants, callback) {
    const req = new XMLHttpRequest();
    var url =
        "https://api.toornament.com/viewer/v2/tournaments/" +
        config.get(msg.guild.id).toornament.id +
        "/participants";
    req.open("GET", url);
    req.setRequestHeader("X-Api-Key", "" + secret_conf.TOORNAMENT_TOKEN);
    req.setRequestHeader("Range", "participants=" + range + "-" + (range + 49));
    req.addEventListener("load", function() {
        if (req.status < 200 && req.status >= 400)
            console.error(req.status + " " + req.statusText + " " + url);
    });
    req.addEventListener("error", function() {
        console.error("Error with URL " + url);
    });
    req.addEventListener("readystatechange", function() {
        if (req.readyState === 4) {
            if (req.status >= 400) {
                //log(msg.guild, "Toornament not found.");
                return;
            }
            var part = JSON.parse(req.responseText);
            participants = participants.concat(part);
            if (part.length && !(participants.length % 50)) {

                getParticipants(range + 50, msg, participants, callback);
            } else {
                callback(msg, participants);
            }
        }
    });
    req.send(null);
}

//print participants
function printParticipants(msg, participants) {
    var text = "";
    if (!participants.length) {
        msg.channel.send("**No participants**");
    } else {
        participants.sort(function(a, b) {
            if (a.name > b.name) return 1;
            else if (a.name < b.name) return -1;
            else return 0;
        });
        text = "**" + participants.length + " participants:**\n";
        var def = "**" + participants.length + "**\n*List cannot be displayed.*";
        for (var p = 0; p < participants.length; p++) {
            text += "\n" + participants[p].name;
        }
        if (text.length > 2000) msg.channel.send(def);
        else msg.channel.send(text);
    }
}

function editParticipants(msg, participants) {
    var conf_part = config.get(msg.guild.id).guild.participant;
    //var conf_lead = config.get(msg.guild.id).guild.leaders;

    var text_part = "";
    //var text_lead='**Leaders:**';
    if (!participants.length) {
        text_part = "**No participants**";
        //text_lead=("**No participants**");
    } else {
        participants.sort(function(a, b) {
            if (a.name.toLowerCase() > b.name.toLowerCase()) return 1;
            else if (a.name.toLowerCase() < b.name.toLowerCase()) return -1;
            else return 0;
        });
        text_part = "**" + participants.length + " participants :**\n";
        for (var p = 0; p < participants.length; p++) {
            text_part += "\n" + participants[p].name;
            // text_lead+="\n\n**"+participants[p].name+"**\n"+participants[p].custom_fields.discord_du_des_capitaine_s_+" / "+participants[p].custom_fields.code_ami_du_capitaine;
        }
        if (text_part.length > 2000)
            text_part =
            "**" +
            participants.length +
            " participants**\n*List cannot be displayed.*";
    }
    if (conf_part.channel) {
        msg.guild.channels.cache
            .get(conf_part.channel).messages.fetch(conf_part.msg)
            //.get(conf_part.msg).edit(text_part);
            .then(message => editMessage(message, text_part));
    }
    // if(conf_lead.channel)
    // msg.guild.channels.cache.get(conf_lead.channel).fetchMessage(conf_lead.msg).then(message => editMessage(message,text_lead));
}

//edit message
function editMessage(msg, text) {
    msg.edit(text);
}

//return groups id from a tournament
function getGroupsId(response) {
    var groups = [];
    for (var i = 0; i < response.length; i++) {
        //console.log(response[i].name);
        if (response[i].name.toLowerCase().includes("group"))
            groups.push(response[i].id);
    }
    return groups;
}

//return stages
function getStages(guild) {
    const req = new XMLHttpRequest();
    var url =
        "https://api.toornament.com/viewer/v2/tournaments/" +
        config.get(guild.id).toornament.id +
        "/stages";
    req.open("GET", url);
    req.setRequestHeader("X-Api-Key", "" + secret_conf.TOORNAMENT_TOKEN);
    req.addEventListener("load", function() {
        if (req.status < 200 && req.status >= 400)
            console.error(req.status + " " + req.statusText + " " + url);
    });
    req.addEventListener("error", function() {
        console.error("Error with URL " + url);
    });
    req.addEventListener("readystatechange", function() {
        if (req.readyState === 4) {
            return JSON.parse(req.responseText);
        }
    });
    req.send(null);
}

//return participants of a group.
function getGroupParticipants(groupid, guild, groupsId, callback) {
    var allcaptains = [];
    var friend_codes = [];
    guild.roles
        .fetch(config.get(guild.id).guild.leaders.role)
        .then(role=>{
            var captainmembers=role.members.array();

    for (var y = 0; y < groupsId.length + 2; y++) {
        const req = new XMLHttpRequest();
        var url =
            "https://api.toornament.com/viewer/v2/tournaments/" +
            config.get(guild.id).toornament.id +
            "/matches?group_numbers=" +
            y;
        req.open("GET", url);
        req.setRequestHeader("X-Api-Key", "" + secret_conf.TOORNAMENT_TOKEN);
        //req.setRequestHeader('group_ids', '' + groupid);
        req.setRequestHeader("Range", "matches=0-127");
        req.addEventListener("load", function() {
            if (req.status < 200 || req.status >= 400)
                console.error(req.status + " " + req.statusText + " " + url);
        });
        req.addEventListener("error", function() {
            console.error("Error with URL " + url);
        });
        req.addEventListener("readystatechange", function() {
            if (req.readyState === 4) {
                var matches = [];
                try {
                    matches = JSON.parse(req.responseText);
                } catch (e) {
                    matches = [];
                }
                var captains = [];
                var match;
                for (var i = 0; i < matches.length; i++) {
                    if (
                        matches[i].opponents &&
                        matches[i].opponents[0].participant &&
                        matches[i].opponents[1].participant
                    ) {
                        //console.log(matches[i]);
                        var user1 = matches[i].opponents[0].participant.name;
                        var user2 = matches[i].opponents[1].participant.name;
                        if (!captains.includes(user1)) {
                            captains.push(user1);
                        }
                        if (!captains.includes(user2)) {
                            captains.push(user2);
                        }
                        match = matches[i];
                    }
                }
                //if (captains.length == 4) {
                var rolename = "G";
                for (var z = 0; z < groupsId.length; z++) {
                    if (match && groupsId[z] == match.group_id) rolename += z + 1;
                }
                guild.roles.fetch()
                .then(roles=> {var role = roles.cache.find((role,rolename) => role.name==rolename);
                    console.log(rolename);
                for (var j = 0; j < 4; j++) {
                    try {
                        var nb = 0;
                        for (var k = 0; k < captainmembers.length; k++) {
                            if (captainmembers[k].displayName && captains[j]) {
                                //console.log(captainmembers[k].nickname);
                                if (
                                    captainmembers[k].displayName
                                    .toLowerCase()
                                    .startsWith(captains[j].toLowerCase())
                                ) {
                                    captainmembers[k].roles.add(role.id);
                                    nb++;
                                }
                            }
                        }
                    } catch (error) {
                        console.log(
                            "Error with " +
                            captains[j] +
                            " (group " +
                            rolename.substring(1) +
                            ")"
                        );
                        console.error(error);
                    }
                }
            });
            }
        });
        req.send(null);
    }
});
}

//create a group channel&role
function createGroup(guild, j) {
    var chan;
    guild.channels.create("group-" + j, {
            type: "text"
        })
        .then(channel => channel.setParent(config.get(guild.id).guild.groups))
        .then(channel =>
            guild
            .roles.create({
                data: {
                    name: "G" + j,
                    hoist: false,
                    mentionable: true
                }
            })
            .then(role =>{
                var roles=[];
                roles = config.get(guild.id).guild.organizer;
                roles.push(role.id);
                console.log(roles);
                givePerm(guild, channel, roles);
                roles.pop();
            }
            )
            .catch(error => console.error(error))
        )

        .catch(error => console.log(error));
}

function givePerm(guild, channel, roles) {
    let permissions=[];
    for (var i = 0; i < roles.length; i++) {
        try{
            permissions.push({
                id:roles[i],
                allow:["VIEW_CHANNEL","SEND_MESSAGES"]
            });
        }catch(e){

        }
    }
    permissions.push({
        id:guild.roles.everyone.id,
        deny:["VIEW_CHANNEL","SEND_MESSAGES"]
    });
    channel.overwritePermissions(permissions);
}

//log function
function log(guild, content) {
    var logChannel = guild.channels.cache.get(config.get(guild.id).guild.log);
    if (logChannel != null && content != "") {
        logChannel.send(content);
    }
}

//check cmd channel
function checkCmd(msg) {
    return msg.channel.id == config.get(msg.guild.id).guild.cmd;
}

//guild join event
client.on("guildCreate", guild => {
    fs.readFile(__dirname + "/config/0.json", "utf-8", function(err, content) {
        if (err) throw err;
        content = JSON.parse(content);
        content.guild.id = guild.id;
        content.guild.name = guild.name;
        content = JSON.stringify(content);
        fs.writeFile(__dirname + "/config/" + guild.id + ".json", content, err => {
            if (err) throw err;
            console.log("Added configuration for " + guild.name);
        });
    });
});

//guild delete/left event
client.on("guildDelete", guild => {
    fs.readFile(__dirname + "/config/0.json", "utf-8", function(err, content) {
        if (err) throw err;
        fs.writeFile(__dirname + "/config/" + guild.id + ".json", content, err => {
            if (err) throw err;
            console.log("Deleted configuration for " + guild.name);
        });
    });
});

//connection event
client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}.`);
    var guilds = client.guilds.cache.array();
    for (var g = 0; g < guilds.length; g++) {
        //getParticipants(0, guilds[g].roles.everyone, [], editParticipants);
    }
});

//message publication event
client.on("message", msg => {
    guild = msg.guild;

    try {
        if (msg.channel.type == "text") {
            var m = msg.content;
            var member = msg.member;
            guild = msg.guild;
            if (m.startsWith("!") || m.startsWith("?")) {
                //command used to remove roles from all concerned members
                if (m.toLowerCase().includes("kill") && checkCmd(msg)) {
                    var roles = msg.mentions.roles.array();
                    for (var j = 0; j < roles.length; j++) {
                        var members = guild.roles.cache
                            .find("name", roles[j].name)
                            .members.array();
                        for (var i = 0; i < members.length; i++) {
                            members[i].removeRole(roles[j]);
                            //log(guild, members[i] + ' was removed from ' + roles[j] + ' role.');
                        }
                        log(guild, roles[j] + " removed.");
                    }
                } else if (m.toLowerCase().includes("make") && checkCmd(msg)) {
                    if (m.toLowerCase().includes("gr")) {
                        toornamentGet("groups", "0-49", msg.guild, function(response) {
                            var groupsId = [];
                            groupsId = getGroupsId(response);
                            for (var i = 0; i < groupsId.length; i++) {
                                createGroup(guild, i + 1);
                            }
                        });
                    } else if (m.toLowerCase().includes("alpha")) {
                        msg.channel.send("Not supported yet.");
                    } else if (m.toLowerCase().includes("bravo")) {
                        msg.channel.send("Not supported yet.");
                    }
                } else if (m.toLowerCase().includes("setgr") && checkCmd(msg)) {
                    msg.guild.roles.fetch();
                    toornamentGet("groups", "0-49", msg.guild, function(response) {
                        var groupsId = [];
                        groupsId = getGroupsId(response);

                        for (var i = 0; i < 10; i++) {
                            getGroupParticipants(groupsId[0], guild, groupsId, function(
                                friend_codes
                            ) {});
                        }
                    });
                } else if (m.toLowerCase().includes("start") && checkCmd(msg)) {
                    toornamentGet("groups", "0-49", msg.guild, function(response) {
                        var groupsId = [];
                        groupsId = getGroupsId(response);

                        // var mapsname=['maps-and-modes', 'stages-et-modes', 'maps-und-modes', 'mappe-e-modalità', 'maps-en-spelstanden', 'maps-and-modes-ru', 'mapas-y-modos'];
                        // var maps=[];
                        // for(var i=0;i<mapsname.length;i++){
                        //    maps.push(guild.channels.cache.find('name',mapsname[i]));
                        // }
                        // if (config.get(msg.guild.id).lang == "en") {
                        //     for (var i = 1; i < groupsId.length + 1; i++) {
                        //         var txt = "Hello ";
                        //         //if(!secret_conf.INDEV)
                        //         txt += guild.roles.cache.find("name", "G" + i);
                        //         txt +=
                        //             "!\nThis is your group channel, " +
                        //             "which you'll use to:\n" +
                        //             " - post the results in this format: **Team 1 2-0 Team 2**\n" +
                        //             " - ask your questions to your TO\n" +
                        //             "You can also use it to organise your matches, or use DMs. " +
                        //             "\nYou can only **speak English**, so everyone can understand you." +
                        //             "\n**Be careful, no rematch allowed in case of disconnection during group phase !**" +
                        //             "\nDon't forget, the tournament continues after the group phase ! " +
                        //             "You'll continue in ALPHA or BRAVO depending on your results." +
                        //             "";
                        //         // for(var j=0;j<maps.length;j++){
                        //         //    txt+=maps[j];
                        //         // }
                        //
                        //         txt += "\nGood luck and have fun !";
                        //
                        //         guild.channels.cache.find("name", "group-" + i).send(txt);
                        //     }
                        // } else if (config.get(msg.guild.id).lang == "fr") {
                        //     for (var i = 1; i < groupsId.length + 1; i++) {
                        //         var txt = "Bonjour à tous ";
                        //         //if(!secret_conf.INDEV)
                        //         //txt+=guild.roles.cache.find('name','G'+i);
                        //         txt +=
                        //             "!\nCeci est votre salon de groupe, " +
                        //             "que vous utiliserez pour :\n" +
                        //             " - organiser vos matchs\n" +
                        //             " - poster les résultats selon ce format : **Équipe 1 2-0 Équipe 2**\n" +
                        //             " - poser vos questions si vous en avez\n" +
                        //             " - prévenir du moindre problème rencontré\n" +
                        //             "\nEt n'oubliez pas que le tournoi continue après cette phase de groupe" +
                        //             "\n**Les phases finales commenceront à 16h pour certaines équipes, il faudra patienter un peu.**" +
                        //             "\n\n**N'oubliez pas de désactiver les bonus secondaires**" +
                        //             "";
                        //         // for(var j=0;j<maps.length;j++){
                        //         //    txt+=maps[j];
                        //         // }
                        //
                        //         txt += "\nBonne chance à toutes et à tous !";
                        //
                        //         guild.channels.cache.find("name", "groupe-" + i).send(txt);
                        //     }
                        // }
                    });
                } else if (m.toLowerCase().includes("endandreset") && checkCmd(msg)) {
                    var channels = msg.guild.channels.cache.array();

                    for (var i = 0; i < channels.length; i++) {
                        if (
                            channels[i].parent &&
                            channels[i].parent.id == config.get(guild.id).guild.groups
                        ) {
                            channels[i].delete();
                        }
                    }
                    log(guild, "Group channels deleted.");
                    var roles = msg.guild.roles.cache.array();
                    for (var i = 0; i < roles.length; i++) {
                        if (roles[i].name.includes("G")) {
                            roles[i].delete();
                        }
                    }
                    log(guild, "Group roles deleted.");
                    /*for (var i = 0; i < members.length; i++) {
                                  if(!members[i].hasPermission('ADMINISTRATOR')){
                                  members[i].setNickname('');
                                  log(guild, members[i] + '\'s nickname reset');
                              }
                              }*/
                    //log(guild,'Done.');
                    try {
                        var members = guild.roles.cache.find("name", "ALPHA").members.array();
                        for (var i = 0; i < members.length; i++) {
                            members[i].removeRole(guild.roles.cache.find("name", "ALPHA"));
                            //log(guild, members[i] + ' was removed from ' + roles[j] + ' role.');
                        }
                        log(guild, "ALPHA role removed.");
                        var members = guild.roles.cache.find("name", "BRAVO").members.array();
                        for (var i = 0; i < members.length; i++) {
                            members[i].removeRole(guild.roles.cache.find("name", "BRAVO"));
                            //log(guild, members[i] + ' was removed from ' + roles[j] + ' role.');
                        }
                        log(guild, "BRAVO role removed.");
                    } catch (e) {}

                    log(guild, "Done.");
                } else if (
                    msg.content.toLowerCase().startsWith("!config") &&
                    !msg.author.bot &&
                    (msg.member.hasPermission("ADMINISTRATOR") ||
                        msg.member.id == secret_conf.MAIN_DEV_ID)
                ) {
                    editConfig(msg);
                }
                //               else if(msg.content.toLowerCase().startsWith('!participant')){

                //                 getParticipants(0,msg,[],printParticipants);
                //               }
            }
            //help command
            if (
                m.toLowerCase().includes("help") &&
                !msg.author.bot &&
                checkCmd(msg)
            ) {
                help(msg);
            }
            //respond-test command (reserved)
            if (
                m.toLowerCase().includes("ping") &&
                msg.member.id == secret_conf.MAIN_DEV_ID
            ) {
                msg.channel.send("pong");
            }
            //information getter (reserved)

            //to exec at every message
            getParticipants(0, msg, [], editParticipants);
        }

        if (
            msg.content.toLowerCase() == "tellme" &&
            msg.author.id == secret_conf.MAIN_DEV_ID
        ) {
            //msg.channel.send(msg.guild.iconURL);
            //toornamentGet('participants', '0-49', function(response) {console.log(response);});
            //console.log(client.guilds.find('id','476424419414376448').name);
        }
    } catch (error) {
        console.log(error);
        log(msg.guild, msg.member + ", an error as occured.");
    }
});

client.on("messageUpdate", function(oldMsg, newMsg) {
    if (oldMsg.channel.type == "text") {
        if (!oldMsg.author.bot) getParticipants(0, oldMsg, [], editParticipants);
    }
});

client.on("messageDelete", function(oldMsg) {
    if (oldMsg.channel.type == "text") {
        getParticipants(0, oldMsg, [], editParticipants);
    }
});

client.on('error', console.error);

client.login(secret_conf.TOKEN);
