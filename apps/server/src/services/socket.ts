import { Server as SocketServer } from "socket.io";
import Redis from "ioredis";

const pub = new Redis({
    host: "redis-dfc0e3a-sumanacharyya.a.aivencloud.com",
    port: 12375,
    username: "default",
    password: "<ENTER_YOUR_PASSWORD>",
});
const sub = new Redis({
    host: "redis-dfc0e3a-sumanacharyya.a.aivencloud.com",
    port: 12375,
    username: "default",
    password: "<ENTER_YOUR_PASSWORD>",
});

class SocketServices {
    private _io: SocketServer;
    constructor() {
        console.log("Init Socket Server");

        this._io = new SocketServer({
            cors: {
                allowedHeaders: ["*"], //? Allowing everything
                origin: "*", //? Allowing everything
            },
        });

        sub.subscribe("MESSAGES");
    }

    public initListeners() {
        const io = this.io;
        console.log("Init Socket Listeners...!");

        io.on("connect", function (socket) {
            console.log(`New socket connected: ${socket.id} `);

            socket.on(
                "event:message",
                async function ({ message }: { message: string }) {
                    console.log(`New message received: ${message}`);
                    // Publish this message to REDIS:DB
                    await pub.publish("MESSAGES", JSON.stringify({ message }));
                }
            );
        });
        sub.on("message", (channel, message) => {
            if (channel === "MESSAGES") {
                io.emit("message", message);
            }
        });
    }

    get io() {
        return this._io;
    }
}

export default SocketServices;
