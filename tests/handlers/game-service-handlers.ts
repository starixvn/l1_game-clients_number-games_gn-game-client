import { Server } from "mock-socket";
export class MockGameService {
    private messages = [];
    private connection: WebSocket;
    private mockServer: Server;

    constructor(url) {
        this.mockServer = new Server(url);
        this.connection = new WebSocket(url);
        this.connection.onmessage = (event) => {
            this.messages.push(event.data);
        };

        this.setupData();
    }

    sendMessage(message) {
        this.connection.send(message);
    }

    private setupData() {
        this.mockServer.on("connection", (socket) => {
            socket.on("message", (message) => {
                if (typeof message !== "string") {
                    return;
                }
                const data = JSON.parse(message.toString());
                console.log("Received a message from the client", data);
                if (data.signin) {
                    socket.send("test message from mock server");
                    console.log("test message from mock server");
                }
            });
        });
    }
    close() {
        this.mockServer.close();
    }
}
export enum ServerMessageType {
    signin = "signin",
    inGame = "inGame",
}

export interface ServerMessage {
    id: number;
    type: ServerMessageType;
    content: string;
}
