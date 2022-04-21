"use strict"
var socket = io()
let username;
window.addEventListener("load", function (evt){
    username = document.querySelector("#username").innerText;
    socket.emit("username", username);
    setCookie("username", username, 1)
    let sendButton = document.querySelector("#sendButton");
    let chatText = document.querySelector("#chatText");
    let messageList = document.querySelector("#messageList");

    chatText.addEventListener("keypress", (evt)=>{
        if(evt.keyCode == 13 && chatText.value != ""){
            socket.emit("chat_message", (chatText.value));
            chatText.value = "";
        }
    })

    sendButton.addEventListener("click", function(evt){
        if(chatText.value != ""){
            socket.emit("chat_message", (chatText.value));
            chatText.value = "";
        }

    })

    socket.on("chat_message", (message)=>{
        let li = document.createElement("li");
        li.innerHTML = message;
        messageList.append(li);

    })
})