
import React, { useState, useEffect } from 'react';
import { blogPosts, BlogPost } from '../data/blogData';

const formatMarkdown = (content: string) => {
    if (!content) return { __html: '' };

    // Split content into blocks by one or more empty lines
    const blocks = content.split(/\n\s*\n/);

    const html = blocks.map(block => {
        const trimmedBlock = block.trim();

        // Inline formatting function
        const formatInline = (text: string) => text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        // Headings
        if (trimmedBlock.startsWith('#### ')) {
            return `<h4 class="font-heading font-semibold text-xl mt-4 mb-2">${formatInline(trimmedBlock.substring(5))}</h4>`;
        }
        if (trimmedBlock.startsWith('### ')) {
            return `<h3 class="font-heading font-semibold text-2xl mt-6 mb-3">${formatInline(trimmedBlock.substring(4))}</h3>`;
        }
        
        // Unordered Lists
        if (trimmedBlock.startsWith('* ')) {
            const items = trimmedBlock.split('\n').map(item => {
                if (item.trim().startsWith('* ')) {
                    return `<li>${formatInline(item.trim().substring(2))}</li>`;
                }
                return '';
            }).join('');
            return `<ul class="list-disc list-inside space-y-1">${items}</ul>`;
        }

        // Paragraphs
        if (trimmedBlock) {
            // Replace single newlines within a block with <br> for line breaks
            return `<p>${formatInline(trimmedBlock.replace(/\n/g, '<br />'))}</p>`;
        }

        return '';
    }).join('');

    return { __html: html };
};


const BlogCard: React.FC<{ post: BlogPost; onSelect: () => void }> = ({ post, onSelect }) => {
    return (
        <div 
            onClick={onSelect}
            className="bg-light-card dark:bg-dark-card rounded-lg shadow-soft dark:shadow-soft-dark p-6 text-left flex flex-col border border-black/5 dark:border-white/5 transition-all duration-300 hover:border-light-accent/70 dark:hover:border-dark-accent/70 hover:-translate-y-1 cursor-pointer"
        >
            <h3 className="font-heading font-bold text-2xl mb-2">{post.title}</h3>
            <p className="text-sm text-light-text/70 dark:text-dark-text/70">
                By {post.author} on {post.date}
            </p>
            <p className="mt-4 text-light-text/80 dark:text-dark-text/80 line-clamp-3 flex-grow">
                {post.content.substring(0, 150).replace(/##+/g, '').replace(/\*\*/g, '')}...
            </p>
            <div className="mt-4 text-light-accent dark:text-dark-accent font-bold">Read More &rarr;</div>
        </div>
    );
};

const BlogDetailView: React.FC<{ post: BlogPost; onBack: () => void }> = ({ post, onBack }) => {
    return (
        <div className="bg-light-card dark:bg-dark-card rounded-2xl shadow-soft dark:shadow-soft-dark p-8 animate-fade-in">
            <button onClick={onBack} className="flex items-center gap-2 text-light-accent dark:text-dark-accent font-bold mb-6 hover:underline">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                Back to Blog List
            </button>
            <h1 className="font-heading font-bold text-4xl mb-2">{post.title}</h1>
            <p className="text-md text-light-text/70 dark:text-dark-text/70 mb-6">By {post.author} on {post.date}</p>
            <div 
                className="prose dark:prose-invert max-w-none text-light-text dark:text-dark-text prose-strong:text-light-text dark:prose-strong:text-dark-text prose-headings:text-light-text dark:prose-headings:text-dark-text prose-p:mb-4 prose-ul:my-4 prose-li:my-1"
                dangerouslySetInnerHTML={formatMarkdown(post.content)}
            />
        </div>
    )
}

interface BlogViewProps {
    initialPost?: BlogPost | null;
}

export const BlogView: React.FC<BlogViewProps> = ({ initialPost }) => {
    const [selectedPost, setSelectedPost] = useState<BlogPost | null>(initialPost || null);

    useEffect(() => {
        if (initialPost) {
            setSelectedPost(initialPost);
        }
    }, [initialPost]);

    if (selectedPost) {
        return <BlogDetailView post={selectedPost} onBack={() => setSelectedPost(null)} />;
    }

    return (
        <section className="w-full animate-fade-in">
            <h2 className="font-heading font-bold text-3xl text-center mb-6">
                Steve's Dive Log Blog
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {blogPosts.map(post => (
                    <BlogCard key={post.id} post={post} onSelect={() => setSelectedPost(post)} />
                ))}
            </div>
        </section>
    );
};

export default BlogView;
