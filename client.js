$(document).ready(function() {
  $(".post_box_chat").prop("disabled", true);
  $(".post_box_name").focus();
  var amountOf = 0;
  drawer = false;
  var messages = [];
  var local_array = [];
  var user_list_view = [];
  var GLOBAL_DARK_MODE = false;
  var INITIAL = true;
  //TRIGGER[0] = timestamps, TRIGGER[1] = dark_mode, TRIGGER[2] = (todo)
  var TRIGGER = [1, -1, -1, -1];

  ///////////////////////////////////////////////////////////
  //socket safety net
  try {
    var socket = io.connect();
    ///////////////////////////////////////////////////////////
    //if connected
    socket.on("connect", function() {
      console.log("Connected with id: " + socket.id);
      socket.emit("Entered", {
        "id": socket.id
      });

      ///////////////////////////////////////////////////////////
      //update messages
      //revamped handling for different statuses, i.e. joined/left/new message
      socket.on("update", function(msg) {
        postMessage(0, msg);
      });

      socket.on("user_joined", function(user) {
        postMessage(1, user);
      });

      socket.on("user_left", function(user) {
        postMessage(2, user);
      });

      function postMessage(message_type, msg) {
        var mess;
        console.log("Updating messages...");
        var box = document.querySelector(".chat_container");
        switch (message_type) {
          case 0:
            mess = "<section class='chat_message_wrapper'><section class='chat_info'>" + msg.user +
              "<br><span class='timestamp'>[" + msg.date +
              "]</span></section><section class='chat_content_area'>" + msg.message +
              "</section></section>";
            break;

          case 1:
            mess = "<section class='chat_message_wrapper'><section class='chat_info'><span class='timestamp'>[" + msg.date +
              "]</span></section><section class='chat_content_area status_text'>" + msg.user + msg.message +
              "</section></section>";
            break;

          case 2:
            mess = "<section class='chat_message_wrapper'><section class='chat_info'><span class='timestamp'>[" + msg.date +
              "]</span></section><section class='chat_content_area status_text'>" + msg.user + msg.message +
              "</section></section>";
            break;
        }

        box.innerHTML += mess;

        box.scrollTop = box.scrollHeight;
      }
      ///////////////////////////////////////////////////////////

      ///////////////////////////////////////////////////////////
      //generate the display for all users online
      socket.on("fetch_list", function(usr) {
        local_array = usr.list;
        $(".users_online").html("");
        $(".users_online").empty();
        user_list_view = [];
        $(".ind_user").remove();
        console.log(usr.list);

        //fetch and concatenate the user list, make it visual
        for (var i = 0; i < local_array.length; i++) {
          if (local_array[i][1]) {
            user_list_view.push(["<div class='ind_user " + i + "'><span class='indicator'> </span> " + local_array[i][0] + "</div>"]);
          }
        }
        strung_together = user_list_view.join("");
        document.querySelector(".users_online").innerHTML = strung_together;
      });
      ///////////////////////////////////////////////////////////

      ///////////////////////////////////////////////////////////
      //submit username
      $(".submit").click(function() {
        var username = $(".post_box_name").val();

        if (username) {
          $(".post_box_name, .submit").hide("fast", function() {
            $(".users_online").show("fast");
            $(".secondary").show("fast");
            $(".mini").animate({
              width: '15%',
              height:'65%'
            });
            $(".post_box_chat").focus();
          //$(".toggle_settings").show("fast");
          });
          //to server with new user
          socket.emit("validated", {
            "user": username
          });
          console.log("Attempting to claim name with id " + socket.id);
          console.log("Sent updated user");
          $(".post_box_chat").prop("disabled", false);


        } else {
          alert("Please enter a username 10 characters or less");
        }
      });
      ///////////////////////////////////////////////////////////

      ///////////////////////////////////////////////////////////
      //post message
      $(".post_box_chat").keypress(function(e) {
        var name = $(".post_box_name").val();
        var msg = $(".post_box_chat").val();

        //make sure all requirements are met, i.e. enter button is pressed and the message is not null
        if (e.which == 13 && msg) {
          socket.emit("message", {
            "user": name,
            "message": msg
          });
          $(".post_box_chat").val("");
          console.log("Sending message");
          $(".post_box_chat").focus();
        }
      });

      $(".hamburger, .overlay").click(function() {
        switch (drawer) {
          case false:
            $(".drawer").animate(
              {
                left: "0%"
              }, {
                duration: 350,
                easing: "easeOutExpo"
              }
            );
            $(".overlay").fadeOut({duration: 350, easing: "easeOutExpo"});
            $(".container").animate(
              {
                left: "18%"
              }, {
                duration: 350,
                easing: "easeOutExpo"
              }
            );
            $(".overlay").fadeIn({duration: 350, easing: "easeOutExpo"});
            drawer = true;
            break;
          case true:
            $(".drawer").animate(
              {
                left: "-18%"
              }, {
                duration: 350,
                easing: "easeOutExpo"
              }
            );
            $(".overlay").fadeOut({duration: 350, easing: "easeOutExpo"});
            $(".container").animate(
              {
                left: "0%"
              }, {
                duration: 350,
                easing: "easeOutExpo"
              }
            );

            drawer = false;
            break;
        }
      });
    //Drawer toggle
    });
  }
  //not connected :c
  catch (e) {
    console.log("Could not connect :(");
  }
});
