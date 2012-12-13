var main = {

    init: function () {

        console.log("Main initialised.");

        this.connectSocket();

    },

    connectSocket: function () {

        console.log("Socket connected.");

        this.socket = io.connect("//" + config.socketServer + ":8080");

        this.bindSocketEvents();

    },

    bindSocketEvents: function () {

        console.log("Socket events bound.");

        // general system messages
        this.socket.on("message", function (data) {

            console.log("Message: ", data);

        });

        // receive users on connecting
        this.socket.on("users", function (data) {

            console.log("Users: ", data);

        });

        // presence alerts
        this.socket.on("presence", function (data) {

            console.log("Presence: ", data);

        });

    }

};

$(document).ready(function () {

    console.log("Hello World!");

    main.init();

});