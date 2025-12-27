import React from 'react';
import { InstantDemo } from './InstantDemo';

const FeaturePoint: React.FC<{ icon: React.ReactElement, title: string, description: string }> = ({ icon, title, description }) => (
    <div className="flex flex-col items-center text-center gap-2">
        <div className="w-20 h-20 bg-light-bg dark:bg-dark-bg rounded-xl flex items-center justify-center text-light-accent dark:text-dark-accent mb-2">
            {React.cloneElement(icon as React.ReactElement<any>, { className: "h-10 w-10" })}
        </div>
        <h4 className="font-heading font-bold text-xl">{title}</h4>
        <p className="text-light-text/70 dark:text-dark-text/70">{description}</p>
    </div>
);

interface PartnerPricingCardProps {
    title: string;
    price: string;
    description: string;
    features: string[];
    isFeatured?: boolean;
}

const PartnerPricingCard: React.FC<PartnerPricingCardProps> = ({ title, price, description, features, isFeatured }) => {
    const cardClasses = isFeatured 
        ? "border-light-accent dark:border-dark-accent scale-105 ring-4 ring-light-accent/10 dark:ring-dark-accent/10"
        : "border-black/10 dark:border-white/10";
    const buttonClasses = isFeatured
        ? "bg-gradient-to-r from-light-primary-start to-light-accent text-white"
        : "bg-light-bg dark:bg-dark-bg hover:bg-black/10 dark:hover:bg-white/10";

    return (
        <div className={`relative bg-light-card dark:bg-dark-card rounded-2xl shadow-soft dark:shadow-soft-dark p-8 border-2 flex flex-col text-left ${cardClasses} transition-transform`}>
            {isFeatured && (
                <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-light-accent dark:bg-dark-accent text-white text-xs font-bold px-3 py-1 rounded-full uppercase shadow-md">Best Value</div>
            )}
            <h3 className="font-heading font-bold text-2xl text-center">{title}</h3>
            <p className="text-center my-2 text-light-text/70 dark:text-dark-text/70 font-medium">{description}</p>
            <p className="font-heading font-bold text-5xl text-center my-4">
                <span className="bg-gradient-to-r from-light-primary-start to-light-accent dark:from-dark-primary-start dark:to-dark-accent bg-clip-text text-transparent">{price}</span>
                { !/Custom|\+/.test(price) && <span className="text-lg font-semibold text-light-text/60 dark:text-dark-text/60">/ mo</span> }
            </p>
            <div className="h-px w-full bg-black/5 dark:bg-white/5 my-4"></div>
            <ul className="space-y-3 my-2 flex-grow">
                {features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>
            <a href="mailto:steve@scubasteve.rocks?subject=Scuba Steve Shop Plan Inquiry" className={`block text-center w-full font-bold text-lg py-3 rounded-lg mt-6 transition-colors ${buttonClasses}`}>
                Contact Sales
            </a>
        </div>
    );
};


const PartnerPortalView: React.FC = () => {
    return (
        <section className="animate-fade-in space-y-12 pb-12">
            <div className="bg-light-card dark:bg-dark-card rounded-2xl shadow-soft dark:shadow-soft-dark p-8 text-center">
                <h2 className="font-heading font-bold text-3xl sm:text-4xl mb-4">Hire Scuba Steve for Your Dive Business</h2>
                <p className="max-w-3xl mx-auto text-lg text-light-text/80 dark:text-dark-text/80 mb-8">
                    Integrate the first AI dive assistant built for the dive industry. Provide your customers with an AI that knows your dive sites, your schedule, and your unique offerings, 24/7.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 my-10 max-w-4xl mx-auto">
                    <FeaturePoint 
                        icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>}
                        title="Faster Communication"
                        description="Answer customer questions about bookings, courses, and gear instantly, any time of day."
                    />
                     <FeaturePoint 
                        icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>}
                        title="Multilingual Support"
                        description="Engage with international customers in their native language, expanding your market reach."
                    />
                     <FeaturePoint 
                        icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" /></svg>}
                        title="Guest Engagement"
                        description="Use AI for dive briefings, species identification, and creating a unique guest experience."
                    />
                </div>
            </div>

            <div className="text-center">
                <h3 className="font-heading font-bold text-3xl mb-2">Shop Pricing Tiers</h3>
                <p className="text-lg text-light-text/80 dark:text-dark-text/80 mb-8 max-w-2xl mx-auto">
                    Flexible plans for every dive operation. All plans include marine conservation contributions.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {/* Tier 1 */}
                    <PartnerPricingCard 
                        title="Starter Shop"
                        price="$29"
                        description="For micro-operations or freelance instructors."
                        features={[
                            "1 Shop Account",
                            "2 Active Devices",
                            "~500 AI Chats / Month",
                            "Marine Life ID & Color Correction",
                            "Dive Planning Tools",
                            "Basic Support"
                        ]}
                    />
                    
                    {/* Tier 2 */}
                    <PartnerPricingCard 
                        title="Pro Shop"
                        price="$79"
                        description="Best for busy shops with multiple instructors."
                        features={[
                            "1 Shop Account",
                            "5 Active Devices",
                            "~2,000 AI Chats / Month",
                            "Priority Support",
                            "Early Access to Features",
                            "Full Calculations Suite",
                            "Voice Chat Enabled"
                        ]}
                        isFeatured={true}
                    />
                    
                    {/* Tier 3 */}
                    <PartnerPricingCard 
                        title="Elite Shop"
                        price="$149"
                        description="For large centres, resorts & liveaboards."
                        features={[
                            "1 Shop Account",
                            "10 Active Devices",
                            "~5,000 AI Chats / Month",
                            "Priority Support",
                            "Light White-Labeling (Logo)",
                            "Marketing Assets",
                            "Dedicated Onboarding"
                        ]}
                    />
                </div>

                {/* Add-Ons Section */}
                <div className="mt-12 bg-light-bg dark:bg-dark-bg p-6 rounded-xl border border-black/5 dark:border-white/5 max-w-4xl mx-auto">
                    <h4 className="font-heading font-bold text-xl mb-4">➕ Power-Ups & Add-Ons</h4>
                    <div className="flex flex-col sm:flex-row justify-center gap-8 text-left sm:text-center">
                        <div>
                            <p className="font-bold text-lg">Extra Device</p>
                            <p className="text-light-accent dark:text-dark-accent font-mono text-xl">$5 <span className="text-sm text-gray-500">/ device / month</span></p>
                        </div>
                        <div>
                            <p className="font-bold text-lg">Extra 1,000 Chats</p>
                            <p className="text-light-accent dark:text-dark-accent font-mono text-xl">$12 <span className="text-sm text-gray-500">/ month</span></p>
                        </div>
                    </div>
                </div>

                {/* Conservation Note */}
                <div className="mt-8 max-w-2xl mx-auto p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center gap-3 text-left">
                    <div className="text-3xl">💙</div>
                    <div>
                        <p className="font-bold text-light-text dark:text-dark-text">Dive with Purpose</p>
                        <p className="text-sm text-light-text/80 dark:text-dark-text/80">
                            25% of all Scuba Steve revenue goes directly to verified marine conservation projects. When you subscribe, you're helping protect the ocean.
                        </p>
                    </div>
                </div>
            </div>

            <InstantDemo />
        </section>
    );
};

export default PartnerPortalView;
