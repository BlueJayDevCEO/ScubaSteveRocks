
import React from 'react';

const ApparelIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const AccessoriesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H5v-2H3v-2H1v-4a6 6 0 016-6h1m-2 16h12a2 2 0 002-2v-6a2 2 0 00-2-2h-1.382a1 1 0 00-.94-.66l-2.356-.393a1 1 0 01-.661-.94v-1.382a2 2 0 00-2-2H12a2 2 0 00-2 2v1.382a1 1 0 01-.66.94l-2.357.393a1 1 0 00-.94.66H3a2 2 0 00-2 2v6a2 2 0 002 2h2v-2h2v-2h2v2h2v2zm0 0v-2" /></svg>;
const SwagIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 22V5z" /></svg>;

// New Icons migrated from AffiliateSection
const PadiIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v11.494M12 6.253A3.75 3.75 0 1115.75 10H12v2.507A3.75 3.75 0 1112 6.253z" /></svg>;
const SuuntoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const DrisIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12.25 18.003h-2.5a2.5 2.5 0 01-2.5-2.5v-1.128c0-.986.636-1.853 1.556-2.23l4.318-1.799.03-.013c.2-.083.328-.29.328-.53v-2.3a.5.5 0 00-.5-.5h-2.5a.5.5 0 00-.5.5v1.5a.5.5 0 01-1 0v-1.5a1.5 1.5 0 011.5-1.5h2.5a1.5 1.5 0 011.5 1.5v2.3c0 .986-.636-1.853-1.556 2.23l-4.318 1.799-.03.013c-.2.083-.328-.29-.328-.53v1.128a1.5 1.5 0 001.5 1.5h2.5a.75.75 0 010 1.5z" /><path d="M4.195 10.432c-.086.046-.168.098-.246.155A1 1 0 002.5 11.5v4a1 1 0 001 1h.5a1 1 0 001-1v-4a1 1 0 00-.472-.851 3.51 3.51 0 01-.833-.217z" /><path d="M19.805 10.432c.086.046.168.098.246.155A1 1 0 0121.5 11.5v4a1 1 0 01-1 1h-.5a1 1 0 01-1-1v-4a1 1 0 01.472-.851c.214-.105.51-.18.833-.217z" /></svg>;

const ShopCategory: React.FC<{ title: string; description: string; link: string; icon: React.ReactNode; colorClass?: string; }> = ({ title, description, link, icon, colorClass = "from-light-primary-start/20 to-light-secondary/20 dark:from-dark-primary-start/20 dark:to-dark-secondary/20 text-light-primary-end dark:text-dark-primary-end" }) => (
  <a 
    href={link} 
    target="_blank" 
    rel="noopener noreferrer" 
    className="bg-light-bg dark:bg-dark-bg p-4 rounded-xl flex flex-col items-center text-center gap-3 hover:bg-light-primary-end/10 dark:hover:bg-dark-primary-end/10 border-2 border-transparent hover:border-light-primary-end/50 dark:hover:border-dark-primary-end/50 transition-all transform hover:scale-105 group"
  >
    <div className={`w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-br shadow-sm group-hover:scale-110 transition-transform duration-300 ${colorClass}`}>
        {icon}
    </div>
    <div>
        <h4 className="font-heading font-semibold text-xl text-light-text dark:text-dark-text group-hover:text-light-accent dark:group-hover:text-dark-accent transition-colors">{title}</h4>
        <p className="text-sm text-light-text/70 dark:text-dark-text/70">{description}</p>
    </div>
  </a>
);

export const ShopModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
    >
      <div 
        className="bg-light-card dark:bg-dark-card rounded-2xl shadow-2xl p-6 sm:p-8 max-w-3xl w-full animate-fade-in border border-light-accent/20 dark:border-dark-accent/20 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6 flex-shrink-0">
            <h2 className="font-heading font-semibold text-3xl">Scuba Steve's Dive Shop</h2>
            <button onClick={onClose} className="text-3xl text-light-text/70 dark:text-dark-text/70 hover:text-light-accent dark:hover:text-dark-accent transition-colors leading-none">&times;</button>
        </div>
        
        <div className="overflow-y-auto pr-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ShopCategory 
                    title="Apparel & Merch"
                    description="Official T-shirts, hoodies, and hats."
                    link="https://www.facebook.com/profile.php?id=61576321647118"
                    icon={<ApparelIcon />}
                    colorClass="from-pink-400/20 to-rose-500/20 text-pink-600 dark:text-pink-400"
                />
                <ShopCategory 
                    title="Dive Right In Scuba"
                    description="Gear from top brands."
                    link="https://www.diverightinscuba.com/affiliate/328.html"
                    icon={<DrisIcon />}
                    colorClass="from-red-500/20 to-red-700/20 text-red-600 dark:text-red-400"
                />
                <ShopCategory 
                    title="PADI Courses"
                    description="Get certified today."
                    link="https://padi.pxf.io/092rEV"
                    icon={<PadiIcon />}
                    colorClass="from-blue-600/20 to-blue-800/20 text-blue-700 dark:text-blue-400"
                />
                 <ShopCategory 
                    title="Suunto Computers"
                    description="Reliable dive computers."
                    link="https://suunto.pxf.io/vPYdEv"
                    icon={<SuuntoIcon />}
                    colorClass="from-gray-700/20 to-black/20 text-gray-800 dark:text-gray-300"
                />
                <ShopCategory 
                    title="Dive Accessories"
                    description="Lights, safety gear, and cool gadgets."
                    link="https://www.facebook.com/profile.php?id=61576321647118"
                    icon={<AccessoriesIcon />}
                />
                <ShopCategory 
                    title="Stickers & Swag"
                    description="Decals for your tank, car, or laptop."
                    link="https://www.facebook.com/profile.php?id=61576321647118"
                    icon={<SwagIcon />}
                />
            </div>
            <div className="mt-6 text-center text-sm text-light-text/60 dark:text-dark-text/60">
                <p>Every purchase supports the app and marine conservation.</p>
            </div>
        </div>
      </div>
    </div>
  );
};
