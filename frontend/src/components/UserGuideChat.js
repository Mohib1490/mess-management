import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserGuideResponse } from '../utils/userGuide';

const suggestedQuestions = [
    'How do I record a meal?',
    'How do I view a report?',
    'আমি কীভাবে খাবার যোগ করব?',
    'মাসিক রিপোর্ট কীভাবে দেখব?'
];

const UserGuideChat = () => {
    const { admin } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [question, setQuestion] = useState('');
    const [messages, setMessages] = useState([
        {
            id: 0,
            from: 'guide',
            answer: 'Hi! I’m your app guide. Ask me how to use a page, and I’ll point you in the right direction. বাংলাতেও প্রশ্ন করতে পারেন।',
            link: null
        }
    ]);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            inputRef.current?.focus();
        }
    }, [isOpen, messages]);

    const askQuestion = (value) => {
        const trimmedQuestion = value.trim();
        if (!trimmedQuestion) return;

        const response = getUserGuideResponse(trimmedQuestion, admin?.role);
        setMessages((currentMessages) => [
            ...currentMessages,
            { id: Date.now(), from: 'user', question: trimmedQuestion },
            { id: Date.now() + 1, from: 'guide', ...response }
        ]);
        setQuestion('');
    };

    return (
        <div className="fixed bottom-5 right-5 z-[60]">
            {isOpen && (
                <section
                    aria-label="User guide chat"
                    className="mb-3 flex h-[min(540px,calc(100vh_-_120px))] w-[calc(100vw_-_2rem)] max-w-[360px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
                >
                    <header className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-800 px-4 py-3 text-white">
                        <div className="flex items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-xl" aria-hidden="true">💬</span>
                            <div>
                                <h2 className="font-semibold">App Guide</h2>
                                <p className="text-xs text-blue-100">Ask in English or বাংলা</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            aria-label="Close app guide"
                            className="rounded-lg p-2 text-xl leading-none hover:bg-white/15"
                        >
                            ×
                        </button>
                    </header>

                    <div className="flex-1 space-y-4 overflow-y-auto bg-gray-50 p-4" aria-live="polite">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.from === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-[88%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                                    message.from === 'user'
                                        ? 'rounded-br-sm bg-blue-600 text-white'
                                        : 'rounded-bl-sm border border-gray-200 bg-white text-gray-700 shadow-sm'
                                }`}>
                                    <p>{message.from === 'user' ? message.question : message.answer}</p>
                                    {message.link && (
                                        <Link
                                            to={message.link.to}
                                            onClick={() => setIsOpen(false)}
                                            className="mt-2 inline-flex font-semibold text-blue-700 underline underline-offset-2 hover:text-blue-900"
                                        >
                                            {message.link.label} →
                                        </Link>
                                    )}
                                </div>
                            </div>
                        ))}
                        {messages.length === 1 && (
                            <div className="flex flex-wrap gap-2">
                                {suggestedQuestions.map((suggestion) => (
                                    <button
                                        key={suggestion}
                                        type="button"
                                        onClick={() => askQuestion(suggestion)}
                                        className="rounded-full border border-blue-200 bg-white px-3 py-2 text-left text-xs font-medium text-blue-700 hover:bg-blue-50"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            askQuestion(question);
                        }}
                        className="flex items-center gap-2 border-t border-gray-200 bg-white p-3"
                    >
                        <label className="sr-only" htmlFor="user-guide-question">Ask the app guide</label>
                        <input
                            id="user-guide-question"
                            ref={inputRef}
                            value={question}
                            onChange={(event) => setQuestion(event.target.value)}
                            placeholder="Ask in English or বাংলা..."
                            className="min-w-0 flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                        <button
                            type="submit"
                            disabled={!question.trim()}
                            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Send
                        </button>
                    </form>
                </section>
            )}

            <button
                type="button"
                onClick={() => setIsOpen((open) => !open)}
                aria-label={isOpen ? 'Close app guide' : 'Open app guide'}
                aria-expanded={isOpen}
                className="ml-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-700 text-2xl text-white shadow-lg transition hover:scale-105 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300"
            >
                {isOpen ? '×' : '💬'}
            </button>
        </div>
    );
};

export default UserGuideChat;
