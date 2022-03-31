module.exports = {
    battle: function (player1, player2, io, room){
        console.log("game started")
        console.log(player1)
        io.to("battle"+room).emit("redirect")
    }
}