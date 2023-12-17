"use client";
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";
import { io, Socket } from "socket.io-client";

interface ISocketProviderProps {
    children?: React.ReactNode;
}

interface ISocketContext {
    // eslint-disable-next-line no-unused-vars
    sendMessage: (msg: string) => any;
    messages: string[];
}

const SocketContext = createContext<ISocketContext | null>(null);

export const SocketProvider: React.FC<ISocketProviderProps> = ({
    children,
}) => {
    const [socket, setSocket] = useState<Socket>();
    const [messages, setMessages] = useState<string[]>([]);

    const sendMessage: ISocketContext["sendMessage"] = useCallback(
        (msg) => {
            console.log("send message >>> ", msg);
            if (socket) {
                socket.emit("event:message", { message: msg });
            }
        },
        [socket]
    );

    const onMessageRes = useCallback((msg: string) => {
        const { message } = JSON.parse(msg) as { message: string };
        console.log("'new Message received >>> ", message);
        setMessages((prev) => [...prev, message]);
    }, []);

    useEffect(() => {
        const _socket = io("http://localhost:8080");
        _socket.on("message", onMessageRes);
        setSocket(_socket);
        return () => {
            _socket.off("message, onMessageRes");
            _socket.disconnect();
            setSocket(undefined);
        };
    }, []);

    return (
        <SocketContext.Provider value={{ sendMessage, messages }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    const state = useContext(SocketContext);
    if (!state) {
        throw new Error("State is undefined");
    }
    return state;
};
