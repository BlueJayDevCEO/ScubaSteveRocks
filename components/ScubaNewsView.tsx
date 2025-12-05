
import React from 'react';
import { ScubaNewsArticle } from '../types';
import { SkeletonLoader } from './SkeletonLoader';

interface ScubaNewsViewProps {
    articles: ScubaNewsArticle[];
    isLoading: boolean;
    error: string | null;
}

const NewsCard: React.FC<{ article: ScubaNewsArticle, isFeatured?: boolean }> = ({ article, isFeatured = false }) => {
    if (isFeatured) {
        return (
            <div className="bg-light-bg dark:bg-dark-bg p-6 rounded-lg border-2 border-light-accent/30 dark:border-dark-accent/30">
                <h3 className="font-heading font-bold text-3xl mb-3">
                    <a href={article.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {article.title}
                    </a>
                </h3>
                <p className="text-lg text-light-text/80 dark:text-dark-text/80 mb-4">{article.summary}</p>
                {article.url && (
                    <a href={article.url} target="_blank" rel="noopener noreferrer" className="font-bold text-light-accent dark:text-dark-accent hover:underline">
                        Read Full Story &rarr;
                    </a>
                )}
            </div>
        );
    }

    return (
        <div className="bg-light-bg dark:bg-dark-bg p-4 rounded-lg">
            <h4 className="font-heading font-semibold text-xl mb-2">
                <a href={article.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {article.title}
                </a>
            </h4>
            <p className="text-md text-light-text/70 dark:text-dark-text/70 mb-3 line-clamp-3">{article.summary}</p>
            {article.url && (
                <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-light-accent dark:text-dark-accent hover:underline">
                    Read More &rarr;
                </a>
            )}
        </div>
    );
};

const NewsSkeleton: React.FC = () => (
    <div className="space-y-8">
        <div>
            <SkeletonLoader type="line" width="70%" height="36px" className="mb-4" />
            <SkeletonLoader type="line" width="100%" height="20px" className="mb-2" />
            <SkeletonLoader type="line" width="90%" height="20px" className="mb-4" />
            <SkeletonLoader type="line" width="30%" height="20px" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
                <div key={i} className="bg-light-bg dark:bg-dark-bg p-4 rounded-lg">
                    <SkeletonLoader type="line" width="80%" height="24px" className="mb-3" />
                    <SkeletonLoader type="line" width="100%" height="16px" className="mb-2" />
                    <SkeletonLoader type="line" width="95%" height="16px" className="mb-3" />
                    <SkeletonLoader type="line" width="40%" height="16px" />
                </div>
            ))}
        </div>
    </div>
);


export const ScubaNewsView: React.FC<ScubaNewsViewProps> = ({ articles, isLoading, error }) => {
    const featuredArticle = articles.length > 0 ? articles[0] : null;
    const moreArticles = articles.length > 1 ? articles.slice(1) : [];

    return (
        <section className="bg-light-card dark:bg-dark-card rounded-2xl shadow-soft dark:shadow-soft-dark p-8 w-full animate-fade-in">
            <h2 className="font-heading font-bold text-3xl text-center mb-6">Latest Scuba News</h2>

            {isLoading && <NewsSkeleton />}
            
            {error && <p className="text-center text-light-accent dark:text-dark-accent py-12">{error}</p>}
            
            {!isLoading && !error && articles.length > 0 && (
                <div className="space-y-8">
                    {featuredArticle && (
                        <div>
                            <h3 className="font-semibold text-lg uppercase tracking-wider text-light-text/60 dark:text-dark-text/60 mb-2">Featured Story</h3>
                            <NewsCard article={featuredArticle} isFeatured={true} />
                        </div>
                    )}
                    {moreArticles.length > 0 && (
                        <div>
                             <h3 className="font-semibold text-lg uppercase tracking-wider text-light-text/60 dark:text-dark-text/60 mb-2">More News</h3>
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {moreArticles.map((article, index) => (
                                    <NewsCard key={index} article={article} />
                                ))}
                             </div>
                        </div>
                    )}
                </div>
            )}
        </section>
    );
};

export default ScubaNewsView;
