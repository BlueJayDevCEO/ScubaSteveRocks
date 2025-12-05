
import React, { useState } from 'react';
import { Briefing } from '../types';
import { shareBriefing } from '../services/jobService';

interface SocialShareButtonsProps {
  briefing: Briefing;
}

const FacebookIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v2.385z"/></svg>;
const TwitterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616v.064c0 2.298 1.634 4.212 3.793 4.649-.65.177-1.354.23-2.065.084.616 1.922 2.396 3.262 4.49 3.301-1.795 1.4-4.075 2.16-6.468 2.023-2.149-.148-4.24-.88-6.166-2.105 2.189 1.407 4.811 2.225 7.625 2.225 9.141 0 14.307-7.721 13.995-14.646.992-.713 1.85-1.611 2.548-2.646z"/></svg>;
const WhatsAppIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.956-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01s-.521.074-.792.372c-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>;
const CopyLinkIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" /><path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" /></svg>;

export const SocialShareButtons: React.FC<SocialShareButtonsProps> = ({ briefing }) => {
  const [copyStatus, setCopyStatus] = useState('Copy');
  
  const shareUrl = shareBriefing(briefing);
  let shareText = `Check out what I discovered with Scuba Steve!`;
  
  if (briefing.type === 'marine_id' && briefing.output?.suggestion) {
    shareText = `I identified a ${briefing.output.suggestion.species_name} with Scuba Steve!`;
  } else if (briefing.type === 'color_correct') {
    shareText = `Scuba Steve color-corrected my underwater photo!`;
  } else if (briefing.type === 'dive_site' && briefing.input?.prompt) {
    const siteName = briefing.input.prompt || 'a dive site';
    shareText = `Getting a dive briefing for ${siteName} from Scuba Steve.`;
  }

  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(shareText);

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`,
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(shareUrl).then(() => {
        setCopyStatus('Copied!');
        setTimeout(() => setCopyStatus('Copy'), 2000);
    }).catch(() => {
        setCopyStatus('Failed!');
        setTimeout(() => setCopyStatus('Copy'), 2000);
    });
  };
  
  const ShareIcon: React.FC<{ href?: string; onClick?: (e: React.MouseEvent) => void; title: string; children: React.ReactNode }> = ({ href, onClick, title, children }) => (
    <a
      href={href}
      onClick={onClick}
      target="_blank"
      rel="noopener noreferrer"
      title={title}
      className="p-2 rounded-full text-light-text/60 dark:text-dark-text/60 hover:bg-light-bg dark:hover:bg-dark-bg hover:text-light-text dark:hover:text-dark-text transition-colors"
    >
        {children}
    </a>
  );


  return (
    <div className="flex items-center gap-1">
        <ShareIcon href={shareLinks.facebook} title="Share on Facebook"><FacebookIcon /></ShareIcon>
        <ShareIcon href={shareLinks.twitter} title="Share on Twitter"><TwitterIcon /></ShareIcon>
        <ShareIcon href={shareLinks.whatsapp} title="Share on WhatsApp"><WhatsAppIcon /></ShareIcon>
        <button
            onClick={handleCopy}
            title="Copy Link"
            className="p-2 rounded-full text-light-text/60 dark:text-dark-text/60 hover:bg-light-bg dark:hover:bg-dark-bg hover:text-light-text dark:hover:text-dark-text transition-colors"
        >
            {copyStatus === 'Copied!' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
            ) : <CopyLinkIcon />}
        </button>
    </div>
  );
};
