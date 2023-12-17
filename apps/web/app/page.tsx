"use client";

import { useState } from "react";
import { useSocket } from "../context/SocketProvider";
import classes from "./page.module.css";

export default function Page() {
    const { sendMessage, messages } = useSocket();
    const [message, setMessage] = useState<string>("");

    return (
        <div>
            <div>
                <input
                    type="text"
                    placeholder="Type message"
                    className={classes["chat-input"]}
                    onChange={(e) => setMessage(e.target.value)}
                />
                <button
                    className={classes["button"]}
                    onClick={() => sendMessage(message)}
                >
                    Send
                </button>
            </div>
            <div>
                {messages &&
                    Array.isArray(messages) &&
                    messages.length > 0 &&
                    messages.map((item) => <li>{item}</li>)}
            </div>
        </div>
    );
}
