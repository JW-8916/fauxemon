"use strict"
var socket = io()
let username;
window.addEventListener("load", function (evt){
    username = document.querySelector("#username").innerText;
    socket.emit("username", username);
    let sendButton = document.querySelector("#sendButton");
    let chatText = document.querySelector("#chatText");
    let messageList = document.querySelector("#messageList");

    chatText.addEventListener("keypress", (evt)=>{
        if(evt.keyCode == 13){
            socket.emit("chat_message", (chatText.value));
            chatText.value = "";
        }
    })

    sendButton.addEventListener("click", function(evt){
        socket.emit("chat_message", (chatText.value));
        chatText.value = "";
    })

    socket.on("chat_message", (message)=>{
        let li = document.createElement("li");
        li.innerHTML = message;
        messageList.prepend(li);

    })
})