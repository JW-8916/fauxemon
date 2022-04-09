module.exports = {
    battle: function (player1, player2, io, room){
        console.log("game started")
        player1.join("battle"+room)
        player2.join("battle"+room)
        io.in("battle"+room).emit("redirect")
    }
}