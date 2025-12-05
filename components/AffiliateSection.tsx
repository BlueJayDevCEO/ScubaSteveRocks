
import React, { useState } from 'react';

interface AffiliateCardProps {
    title: React.ReactNode;
    description: string;
    icon: React.ReactNode;
    cta: string;
    isDonation?: boolean;
    link?: string;
    onClick?: () => void;
    colorClass?: string;
}

const AffiliateCard: React.FC<AffiliateCardProps> = ({ title, description, link, onClick, icon, cta, isDonation, colorClass = "from-light-primary-start/20 to-light-secondary/20 dark:from-dark-primary-start/20 dark:to-dark-secondary/20 text-light-primary-end dark:text-dark-primary-end" }) => {
    const hoverClass = isDonation ? 'hover:border-light-accent/70 dark:hover:border-dark-accent/70 hover:shadow-light-accent/10 dark:hover:shadow-dark-accent/10' : 'hover:border-light-primary-end/70 dark:hover:border-dark-primary-end/70 hover:shadow-cyan-500/10';
    
    const content = (
        <>
            <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br shadow-sm ${colorClass}`}>
                {icon}
            </div>
            <div className="flex-grow min-w-0">
                <h4 className="font-heading font-semibold text-lg truncate">{title}</h4>
                <p className="text-sm text-light-text/70 dark:text-dark-text/70 line-clamp-2">{description}</p>
            </div>
            <div className={`ml-auto text-xs font-bold whitespace-nowrap hidden sm:block opacity-80`}>{cta} &rarr;</div>
        </>
    );

    const baseClasses = `bg-light-card dark:bg-dark-card rounded-xl shadow-soft dark:shadow-soft-dark p-4 flex items-center gap-4 border border-black/5 dark:border-white/5 transition-all duration-300 hover:-translate-y-1 group ${hoverClass}`;

    if (link) {
        return (
            <a href={link} target="_blank" rel="noopener noreferrer" className={baseClasses}>
                {content}
            </a>
        );
    }
    
    return (
        <div onClick={onClick} className={`${baseClasses} cursor-pointer`}>
            {content}
        </div>
    );
};

interface AffiliateSectionProps {
    onOpenShop: () => void;
    onOpenChat: () => void;
    setActiveView: (view: any) => void;
}

export const AffiliateSection: React.FC<AffiliateSectionProps> = ({ onOpenShop, onOpenChat, setActiveView }) => {
    const [showCryptoDonation, setShowCryptoDonation] = useState(false);
    const [donationStatus, setDonationStatus] = useState<'idle' | 'thank_you'>('idle');
    const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

    const handleDonationClick = () => {
        setDonationStatus('thank_you');
        setTimeout(() => setDonationStatus('idle'), 5000); // Reset after 5 seconds
    }

    const handlePortalClick = () => {
        setActiveView('partner_portal');
        setTimeout(() => {
            document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedAddress(label);
            setTimeout(() => setCopiedAddress(null), 2000);
        });
    };

    const shopTitle = (
      <span>
        Official <span className="text-light-accent dark:text-dark-accent">Scuba Steve</span> Shop
      </span>
    );

    return (
        <section className="mt-12 w-full animate-fade-in pb-8">
            <div className="flex items-center justify-center gap-3 mb-6">
                <div className="h-px w-12 bg-black/10 dark:bg-white/10"></div>
                <h2 className="font-heading font-bold text-2xl text-center text-light-text/80 dark:text-dark-text/80">
                    Dive Shop &amp; Community
                </h2>
                <div className="h-px w-12 bg-black/10 dark:bg-white/10"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* --- Static Link Cards First --- */}
                <AffiliateCard 
                    onClick={onOpenShop}
                    title={shopTitle}
                    description="Get official merch, apparel, and dive gear."
                    cta="Enter Shop"
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>}
                    colorClass="from-pink-400/20 to-rose-500/20 text-pink-600 dark:text-pink-400"
                />
                 <AffiliateCard 
                    title="Facebook Community"
                    description="Join our page for updates and community content."
                    link="https://www.facebook.com/profile.php?id=61576321647118"
                    cta="Like Page"
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v2.385z"/></svg>}
                    colorClass="from-blue-500/20 to-blue-600/20 text-blue-600 dark:text-blue-400"
                />
                 <AffiliateCard
                    title="Partner & Shop Portal"
                    description="Hire a custom Scuba Steve for your dive business."
                    onClick={handlePortalClick}
                    cta="For Professionals"
                    isDonation={true}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>}
                    colorClass="from-amber-400/20 to-orange-500/20 text-amber-600 dark:text-amber-400"
                />

                {/* --- Donation Card (Interactive) Moved to Bottom --- */}
                <div className="bg-light-card dark:bg-dark-card rounded-xl shadow-soft dark:shadow-soft-dark p-5 flex flex-col gap-4 border border-black/5 dark:border-white/5 hover:border-light-accent/50 dark:hover:border-dark-accent/50 transition-all">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br from-green-400/20 to-emerald-500/20 dark:from-green-500/20 dark:to-emerald-400/20 shadow-sm text-green-600 dark:text-green-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>
                        </div>
                        <div>
                            <h4 className="font-heading font-semibold text-lg">Support OSEA Diver™</h4>
                            <p className="text-sm text-light-text/70 dark:text-dark-text/70">Help keep Scuba Steve free. We donate 25% of proceeds to marine conservation.</p>
                        </div>
                    </div>
                    
                     {donationStatus === 'thank_you' ? (
                        <div className="text-center p-3 bg-green-500/10 text-green-600 dark:text-green-400 rounded-lg font-bold animate-fade-in border border-green-500/20">
                            Thank you for your support! 🌊
                        </div>
                    ) : (
                        <div className="flex flex-col sm:flex-row gap-3 mt-auto">
                            <a 
                                href="https://buy.stripe.com/eVq4gy8wj090bjZgGA1ZS0e" 
                                onClick={handleDonationClick} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="flex-1 text-center bg-light-accent dark:bg-dark-accent text-white font-bold py-2.5 px-4 rounded-lg hover:opacity-90 transition-colors shadow-md flex items-center justify-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                                Donate via Stripe
                            </a>
                            <button 
                                onClick={() => { setShowCryptoDonation(!showCryptoDonation); }} 
                                className={`flex-1 font-bold py-2.5 px-4 rounded-lg transition-colors border flex items-center justify-center gap-2 ${showCryptoDonation ? 'bg-light-primary-end/20 border-light-primary-end text-light-primary-end dark:bg-dark-primary-end/20 dark:border-dark-primary-end dark:text-dark-primary-end' : 'bg-transparent border-light-text/20 text-light-text/70 hover:border-light-text/50 dark:border-dark-text/20 dark:text-dark-text/70 dark:hover:border-dark-text/50'}`}
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                {showCryptoDonation ? 'Hide Crypto' : 'Crypto'}
                            </button>
                        </div>
                    )}
                    
                    {showCryptoDonation && (
                        <div className="mt-2 space-y-3 p-3 bg-light-bg dark:bg-dark-bg rounded-lg text-left text-sm animate-fade-in border border-black/5 dark:border-white/5">
                            <div onClick={() => copyToClipboard('1ET6vBxCqy1uWS6FVSuamFueER6xDBnzr', 'btc')} className="cursor-pointer group">
                                <div className="flex justify-between text-xs font-bold text-light-text/60 dark:text-dark-text/60 mb-1">
                                    <span>Bitcoin (BTC)</span>
                                    <span className="text-green-500">{copiedAddress === 'btc' ? 'Copied!' : ''}</span>
                                </div>
                                <code className="block bg-light-card dark:bg-dark-card p-2 rounded text-xs break-all border border-transparent group-hover:border-light-accent/30 dark:group-hover:border-dark-accent/30 transition-colors">1ET6vBxCqy1uWS6FVSuamFueER6xDBnzr</code>
                            </div>
                            <div onClick={() => copyToClipboard('r34mWrX3cZCZpJEsqe1F6PNotREXwj1f3r', 'xrp')} className="cursor-pointer group">
                                <div className="flex justify-between text-xs font-bold text-light-text/60 dark:text-dark-text/60 mb-1">
                                    <span>Ripple (XRP) Address</span>
                                    <span className="text-green-500">{copiedAddress === 'xrp' ? 'Copied!' : ''}</span>
                                </div>
                                <code className="block bg-light-card dark:bg-dark-card p-2 rounded text-xs break-all border border-transparent group-hover:border-light-accent/30 dark:group-hover:border-dark-accent/30 transition-colors">r34mWrX3cZCZpJEsqe1F6PNotREXwj1f3r</code>
                            </div>
                            <div onClick={() => copyToClipboard('214572013', 'tag')} className="cursor-pointer group">
                                <div className="flex justify-between text-xs font-bold text-light-text/60 dark:text-dark-text/60 mb-1">
                                    <span>XRP Tag (Required)</span>
                                    <span className="text-green-500">{copiedAddress === 'tag' ? 'Copied!' : ''}</span>
                                </div>
                                <code className="block bg-light-card dark:bg-dark-card p-2 rounded text-xs break-all border border-transparent group-hover:border-light-accent/30 dark:group-hover:border-dark-accent/30 transition-colors">214572013</code>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};
