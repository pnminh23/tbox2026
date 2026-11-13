import { useEffect, useState, useRef } from "react";
import styles from "./ChatBot.module.scss";
import { socket } from "../../../socket";
import { BsFillChatFill, BsFillChatRightDotsFill } from "react-icons/bs";
import { AiOutlineArrowUp } from "react-icons/ai";
import clsx from "clsx";
import dynamic from "next/dynamic";

// Import tĩnh bị lỗi:
// import LoadingItem from '@/components/common/LoadingItem/LoadingItem';
// import LoadingFullPage from '@/components/common/LoadingFullPage/loadingFullPage';

// Thay thế bằng:
const DynamicLoadingItem = dynamic(
    () => import("@/components/common/LoadingItem/LoadingItem"),
    { ssr: false },
);

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isLoadingBot, setIsLoadingBot] = useState(false);

    const messagesEndRef = useRef(null);

    useEffect(() => {
        socket.on("chatbot:reply", (reply) => {
            setMessages((prev) => [...prev, { sender: "bot", text: reply }]);
            setIsLoadingBot(false);
        });

        return () => {
            socket.off("chatbot:reply");
        };
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoadingBot]);

    const sendMessage = () => {
        if (!input.trim()) return;
        setMessages((prev) => [...prev, { sender: "user", text: input }]);
        setInput("");
        setIsLoadingBot(true);
        socket.emit("chatbot:message", input);
    };

    const handleOpenChatbot = () => {
        setIsOpen((prev) => {
            const willOpen = !prev;
            if (willOpen && messages.length === 0) {
                setMessages([
                    {
                        sender: "bot",
                        text: `🎬 Chào bạn! Tôi là chatbot hỗ trợ đặt phòng tại quán cafe phim 🍿 **PNM - BOX**.\nBạn có thể hỏi về:\n- Loại phòng\n- Phim đang chiếu\n- Giờ trống\n- Giá cả...\n\nHãy nhập câu hỏi bất kỳ nhé!`,
                    },
                ]);
            }
            return willOpen;
        });
    };

    return (
        <div>
            <button
                type="button"
                className={styles.chatbotButton}
                onClick={handleOpenChatbot}
                aria-label={isOpen ? "Đóng trợ lý tư vấn" : "Mở trợ lý tư vấn"}
                aria-expanded={isOpen}>
                <BsFillChatRightDotsFill aria-hidden="true" />
            </button>

            {isOpen && (
                <div className={styles.chatbotWindow}>
                    <div className={styles.header}>🤖 Chatbot Tư vấn</div>
                    <div className={styles.messages}>
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`${styles.message} ${
                                    msg.sender === "user"
                                        ? styles.user
                                        : styles.bot
                                }`}>
                                {msg.text.split("\n").map((line, i) => (
                                    <div key={i}>{line}</div>
                                ))}
                            </div>
                        ))}

                        {isLoadingBot && (
                            <div
                                className={clsx(
                                    styles.message,
                                    styles.bot,
                                    styles.loadingMessage,
                                )}>
                                <DynamicLoadingItem />
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    <div className={styles.inputArea}>
                        <input
                            type="text"
                            className={styles.input}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) =>
                                e.key === "Enter" && sendMessage()
                            }
                            placeholder="Nhập câu hỏi..."
                        />
                        <button
                            onClick={sendMessage}
                            className={styles.sendButton}>
                            <AiOutlineArrowUp />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chatbot;
