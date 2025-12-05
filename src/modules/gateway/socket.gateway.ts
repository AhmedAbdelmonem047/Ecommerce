import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Types } from "mongoose";
import { Server, Socket } from "socket.io";



@WebSocketGateway(80, {
    namespace: "/socket",
    cors: {
        origin: "*"
    }
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {

    constructor() { }

    @WebSocketServer()
    private io: Server

    handleConnection(socket: Socket) {
        console.log(`client ${socket.id} connected`);
    }
    handleDisconnect(socket: Socket) {
        console.log(`client ${socket.id} disconnected`);
    }

    @SubscribeMessage("sayHi")
    handleSayHiEvent(@MessageBody() data: any, @ConnectedSocket() socket: Socket) {
        console.log(data);
        socket.emit("sayHi", { msg: "dsfsf" })
    }

    handleProductQuantityChange(productId: Types.ObjectId | string, quantity: number) {
        this.io.emit("productQuantityChange", { productId, quantity });
    }
}