var mqtt = require('mqttjs'),
    port = 8080,
    host = "127.0.0.1",
    topic = "led/status";

mqtt.createClient(port, host, function (err, client) {

    // connect to the MQTT server running at host on port, tell it we're "nodeClient"
    client.connect({

        client: "nodeClient"

    });

    client.on('connack', function (packet) {

        if (packet.returnCode === 0) {

            client.publish({

                topic: topic,

                payload: "off"

            });

            setTimeout(function () {

                client.publish({

                    topic: topic,

                    payload: "on"

                });

            }, 2000);

        } else {

            console.log('connack error %d', packet.returnCode);

            process.exit(-1);

        }

    });

    client.on('publish', function (packet) {

        console.log("Payload received: ", packet.topic, packet.payload);

    });

    client.on('close', function () {

        process.exit(0);

    });

    client.on('error', function (e) {

        console.log('error %s', e);

        process.exit(-1);

    });

});
