import React, { useState, useRef, useEffect } from 'react';
import { sendMessageToGemini } from '../services/geminiService';
import { ChatMessage } from '../types';

const ChatBot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: 'welcome',
            role: 'model',
            text: '¡Hola! Soy tu asistente de DGD Hoteles. ¿En qué puedo ayudarte hoy?',
            timestamp: new Date()
        }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            text: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // Prepare history for Gemini
            const history = messages.map(msg => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.text }]
            }));

            const responseText = await sendMessageToGemini(userMessage.text, history);

            const botMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'model',
                text: responseText,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Chat Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-lg transition-all transform hover:scale-105 ${
                    isOpen ? 'bg-gray-800 rotate-90' : 'bg-primary'
                } text-white flex items-center justify-center`}
                aria-label="Open Chat"
            >
                {isOpen ? (
                    <span className="material-symbols-outlined">close</span>
                ) : (
                    <span className="material-symbols-outlined">smart_toy</span>
                )}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 z-40 w-[350px] md:w-[400px] h-[500px] bg-white dark:bg-[#1a1a2e] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-200">
                    
                    {/* Header */}
                    <div className="bg-primary p-4 flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-full">
                            <span className="material-symbols-outlined text-white">smart_toy</span>
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-sm">Asistente DGD</h3>
                            <p className="text-blue-200 text-xs">Impulsado por Gemini AI</p>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 custom-scrollbar bg-gray-50 dark:bg-[#101022]">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${
                                        msg.role === 'user'
                                            ? 'bg-primary text-white rounded-br-none'
                                            : 'bg-white dark:bg-[#1a1a2e] text-gray-800 dark:text-gray-200 shadow-sm border border-gray-100 dark:border-gray-700 rounded-bl-none'
                                    }`}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white dark:bg-[#1a1a2e] p-4 rounded-2xl rounded-bl-none shadow-sm border border-gray-100 dark:border-gray-700 flex gap-2 items-center">
                                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce"></span>
                                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce delay-75"></span>
                                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce delay-150"></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSendMessage} className="p-3 bg-white dark:bg-[#1a1a2e] border-t border-gray-200 dark:border-gray-800 flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Escribe tu pregunta..."
                            className="flex-1 bg-gray-100 dark:bg-gray-800 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary text-gray-900 dark:text-white"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isLoading}
                            className="bg-primary disabled:opacity-50 text-white p-2.5 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center"
                        >
                            <span className="material-symbols-outlined text-[20px]">send</span>
                        </button>
                    </form>
                </div>
            )}
        </>
    );
};

export default ChatBot;