import { ChatMessage } from '../types';

const ALL_CHATS_KEY = 'scubaSteveAllChats';

type AllChats = {
    [userId: string]: ChatMessage[];
};

const getChatsFromStorage = (): AllChats => {
    try {
        const stored = localStorage.getItem(ALL_CHATS_KEY);
        return stored ? JSON.parse(stored) : {};
    } catch (e) {
        console.error("Failed to parse chats from localStorage", e);
        return {};
    }
}

const setChatsToStorage = (chats: AllChats): void => {
    try {
        localStorage.setItem(ALL_CHATS_KEY, JSON.stringify(chats));
    } catch (e) {
        console.error("Failed to write chats to localStorage", e);
    }
}

export const getChatHistory = async (userId: string): Promise<ChatMessage[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const allChats = getChatsFromStorage();
            resolve(allChats[userId] || []);
        }, 300);
    });
};

export const addChatMessage = (userId: string, message: ChatMessage): void => {
    if (!userId) return;
    const allChats = getChatsFromStorage();
    const userHistory = allChats[userId] || [];
    userHistory.push(message);
    allChats[userId] = userHistory;
    setChatsToStorage(allChats);
};

export const seedInitialChat = (userId: string) => {
    const demoChat: ChatMessage[] = [
        {
            role: 'user',
            content: 'What are the most important things to remember for dive safety?',
        },
        {
            role: 'model',
            content: 'Great question! 🤙 Safety is always number one. The top three things I always tell my students are:\n\n1.  **Never Dive Alone:** Always dive with a buddy and stick together.\n2.  **Check Your Gear:** Do a thorough pre-dive safety check before every single dive.\n3.  **Plan Your Dive, Dive Your Plan:** Know your limits, including depth and time, and stick to them.\n\nHappy bubbles and safe diving! 🐠'
        }
    ];

    const allChats = getChatsFromStorage();
    allChats[userId] = demoChat;
    setChatsToStorage(allChats);
};