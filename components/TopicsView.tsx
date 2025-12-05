
import React from 'react';

interface TopicsViewProps {
    onStartTopicChat: (context: null, message: string) => void;
}

const topics = [
    { name: "Technical Diving", description: "Learn about diving beyond recreational limits.", prompt: "Can you tell me about technical diving? I know you're a recreational diver, so I'd love to hear your perspective and why it's different from what we normally do." },
    { name: "Cave Diving", description: "Explore the unique challenges of overhead environments.", prompt: "What's cave diving all about? As a recreational diver, what are the most important things for me to know about its risks and the special training required?" },
    { name: "Commercial Diving", description: "Discover what a career in underwater work involves.", prompt: "I'm curious about commercial diving. From your recreational standpoint, what does that career involve and how different is it from diving for fun?" },
    { name: "Rebreathers", description: "Understand the technology behind bubble-free diving.", prompt: "I've seen divers with rebreathers. Can you explain what they are and how they work? I'm interested in your take as a recreational instructor." },
];

const TopicCard: React.FC<{ title: string; description: string; onClick: () => void }> = ({ title, description, onClick }) => (
    <div 
        onClick={onClick}
        className="bg-light-card dark:bg-dark-card p-6 rounded-2xl shadow-soft dark:shadow-soft-dark border border-black/5 dark:border-white/5 cursor-pointer hover:-translate-y-1 transition-transform"
    >
        <h3 className="font-heading font-bold text-2xl mb-2">{title}</h3>
        <p className="text-light-text/70 dark:text-dark-text/70">{description}</p>
        <div className="mt-4 font-bold text-light-accent dark:text-dark-accent">Start Chat &rarr;</div>
    </div>
);

export const TopicsView: React.FC<TopicsViewProps> = ({ onStartTopicChat }) => {
    return (
        <section className="w-full animate-fade-in">
            <h2 className="font-heading font-bold text-3xl text-center mb-6">
                Explore Diving Topics
            </h2>
            <p className="text-lg text-light-text/80 dark:text-dark-text/80 max-w-2xl mx-auto text-center mb-8">
                Start a conversation with Steve about specialized areas of diving. He'll share his insights from a recreational diver's perspective.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {topics.map(topic => (
                    <TopicCard 
                        key={topic.name}
                        title={topic.name}
                        description={topic.description}
                        onClick={() => onStartTopicChat(null, topic.prompt)}
                    />
                ))}
            </div>
        </section>
    );
};

export default TopicsView;
