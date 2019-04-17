var port = 8081;
//CHAT VARIABLES
var messages = [];
var users_online = [];
//ROOM VAIRABLES
var filled_squares = [];
//server variables
var fs = require("fs");
var express = require("express");
var package = express();
var server = package.listen(port);
var io = require("socket.io").listen(server);
package.use(express.static(__dirname));

appendTxt(("Server started"));
//do everything on connection
	io.on("connection", function(socket) {
		appendTxt("Client connected");
		//CHAT FUNCTIONALITY ////////////////////////////////////////////////////////////////////
		//validate user is unique & add their useramto array
			socket.on("validated", function(new_user) {
				var timestamp = new Date();
				var full_timestamp = (timestamp.getHours() % 12 || 12) + ":" + timestamp.getMinutes();
				var isDupe = 0;
				var sanitized_name = new_user.user.replace( /<.*?>/g, '' );
				var user_info = [sanitized_name, socket.id];
				for(var i = 0; i < users_online.length; i++) {
					if(!users_online[i] == user_info) {
						isDupe += 1;
					}
				}
				if(isDupe == 0) users_online.push(user_info);

				io.sockets.emit("fetch_list", {"list" : users_online});
				socket.broadcast.emit("user_joined", {
					"user" : sanitized_name, "date" : getTimeStamp(), "message" : " has joined."
				});
				appendTxt((socket.id + " joined with name " + sanitized_name));
			});

			//post message
			socket.on("message", function(msgdata) {
				var timestamp = new Date();
				var full_timestamp = (timestamp.getHours() % 12 || 12) + ":" + timestamp.getMinutes();
				messages.push([full_timestamp, msgdata.user, msgdata.message]);
				var sanitized_message = msgdata.message.replace( /<.*?>/g, '' );
				io.sockets.emit("update", {
					"date" : getTimeStamp(), "user" : msgdata.user, "message" : sanitized_message
				});
				appendTxt("[" + full_timestamp + "] " + msgdata.user + " : " + sanitized_message);
			});

			//remove them from the list if they leave the page
			socket.on("disconnect", function() {
					var location, username;
					for (var u = 0; u < users_online.length; u++) { // Get username
							if (users_online[u][1] == socket.id) {
									username = users_online[u][0];
									location = u;
							}
					}

					if (username !== null) {
							socket.broadcast.emit('user_left', {"user" : username, "date" : getTimeStamp(), "message" : " has left"}); // Tell client user left
							console.log(username + ' has left'); // Tell console user left
							appendTxt(username + ' has left\r\n', function(
									err) {}); // Log user leave
							users_online.splice(location, 1); // Remove user from userList[]
							io.sockets.emit('fetch_list', {
								"list": users_online
							});
							console.log(username + " left: " + users_online);
						}
										appendTxt(users_online);
						});
				});
			//END CHAT FUNCTIONALITY////////////////////////////////////////////////////////


function appendTxt(message) {
	//fs.appendFile("err.txt", message + "\n");
}

function getTimeStamp() {
	var timestamp = new Date();
 	return (timestamp.getHours() % 12 || 12) + ":" + timestamp.getMinutes();
}
