
import React, { useState, useRef, useEffect, useContext } from 'react';
import { User } from '../types';
import { SCUBA_STEVE_AVATAR } from './ScubaSteveLogo';
import { AppContext, BACKGROUNDS } from '../App';

interface ProfileModalProps {
  user: User;
  onClose: () => void;
  onSave: (newName: string, newPhotoUrl: string | null, contributesData: boolean) => void;
  onShowTour: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ user, onClose, onSave, onShowTour }) => {
  const context = useContext(AppContext);
  const configAvatar = context?.config?.avatarUrl || SCUBA_STEVE_AVATAR;
  const currentBgId = context?.backgroundId || 'default';
  const setBackgroundId = context?.setBackgroundId;

  const [editedName, setEditedName] = useState(user.displayName || '');
  const [newPhotoPreview, setNewPhotoPreview] = useState<string | null>(user.photoURL || null);
  const [contributesData, setContributesData] = useState(user.contributesData);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isChanged, setIsChanged] = useState(false);

  useEffect(() => {
    const nameChanged = editedName !== (user.displayName || '');
    const photoChanged = newPhotoPreview !== (user.photoURL || null);
    const contributionChanged = contributesData !== user.contributesData;
    setIsChanged(nameChanged || photoChanged || contributionChanged);
  }, [editedName, newPhotoPreview, contributesData, user.displayName, user.photoURL, user.contributesData]);

  const handlePhotoUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSaveChanges = () => {
    const finalPhotoUrl = newPhotoPreview !== user.photoURL ? newPhotoPreview : null;
    onSave(editedName.trim(), finalPhotoUrl, contributesData);
  };

  const isSaveDisabled = !isChanged || editedName.trim().length === 0;
  
  // Determine display image: Preview > User Photo > Config Avatar > Base64 Default
  const displayImage = newPhotoPreview || user.photoURL || configAvatar;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-light-card dark:bg-dark-card rounded-2xl shadow-2xl p-8 max-w-md w-full animate-fade-in border border-light-accent/20 dark:border-dark-accent/20 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
            <h2 className="font-heading font-semibold text-3xl">Edit Profile</h2>
            <button onClick={onClose} className="text-2xl text-light-text/70 dark:text-dark-text/70 hover:text-light-accent dark:hover:text-dark-accent transition-colors">&times;</button>
        </div>
        
        <div className="flex flex-col items-center gap-6">
            <div className="relative group cursor-pointer" onClick={handlePhotoUploadClick}>
                <img 
                    src={displayImage}
                    alt="Profile" 
                    className="w-32 h-32 rounded-full object-cover border-4 border-light-accent/30 dark:border-dark-accent/30 group-hover:border-light-accent/70 dark:group-hover:border-dark-accent/70 transition-all"
                />
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white font-bold text-sm text-center">Change<br/>Picture</p>
                </div>
                <input 
                    type="file" 
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/png, image/jpeg"
                    onChange={handleFileChange}
                />
            </div>

            <div className="w-full">
                <label htmlFor="displayName" className="block font-heading font-semibold text-lg mb-2">
                    Display Name
                </label>
                <input 
                    id="displayName"
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="w-full p-3 bg-light-bg dark:bg-dark-bg border border-light-accent/30 dark:border-dark-accent/30 rounded-lg focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent focus:border-light-accent dark:focus:border-dark-accent transition-shadow text-base placeholder-light-text/50 dark:placeholder-dark-text/50"
                />
            </div>

            {/* Background Theme Selector */}
            <div className="w-full">
                <h3 className="font-heading font-semibold text-lg mb-3">Visual Theme</h3>
                <div className="grid grid-cols-3 gap-2">
                    {BACKGROUNDS.map((bg) => (
                        <button
                            key={bg.id}
                            onClick={() => setBackgroundId && setBackgroundId(bg.id)}
                            className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all group ${currentBgId === bg.id ? 'border-light-accent dark:border-dark-accent scale-105 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'}`}
                            title={bg.name}
                        >
                            <img src={bg.url} alt={bg.name} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/30 flex items-end justify-center pb-1">
                                <span className="text-[10px] text-white font-bold truncate px-1 shadow-sm">{bg.name}</span>
                            </div>
                            {currentBgId === bg.id && (
                                <div className="absolute top-1 right-1 bg-green-500 rounded-full w-4 h-4 flex items-center justify-center text-white text-xs">✓</div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

             <div className="w-full grid grid-cols-1 gap-4">
                <div className="text-center p-3 bg-light-bg/50 dark:bg-dark-bg/50 rounded-lg">
                    <p className="text-sm text-light-text/70 dark:text-dark-text/70">Total Identifications</p>
                    <p className="font-bold text-3xl text-light-primary-end dark:text-dark-primary-end">{user.identificationCount}</p>
                </div>
            </div>
             <div className="w-full p-4 bg-light-bg/50 dark:bg-dark-bg/50 rounded-lg flex items-center justify-between">
                <div>
                    <label htmlFor="contributeData" className="font-semibold text-base">Contribute my findings</label>
                    <p className="text-xs text-light-text/70 dark:text-dark-text/70">Help improve Marine ID for everyone.</p>
                </div>
                <label htmlFor="contributeData" className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" id="contributeData" className="sr-only peer" checked={contributesData} onChange={() => setContributesData(!contributesData)} />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-light-primary-start/50 dark:peer-focus:ring-dark-primary-start/50 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-light-primary-end dark:peer-checked:bg-dark-primary-end"></div>
                </label>
            </div>
        </div>

        <div className="mt-8 flex gap-4">
             <button 
                onClick={onClose} 
                className="w-full bg-light-text/10 dark:bg-dark-text/10 text-light-text dark:text-dark-text font-bold text-lg py-3 rounded-lg hover:bg-light-text/20 dark:hover:bg-dark-text/20 transition-colors"
            >
                Cancel
            </button>
             <button 
                onClick={handleSaveChanges}
                disabled={isSaveDisabled}
                className="w-full bg-gradient-to-r from-light-primary-start to-light-accent text-white dark:from-dark-primary-start dark:to-dark-accent font-bold text-lg py-3 rounded-lg hover:opacity-90 transition-all shadow-lg shadow-light-accent/20 dark:shadow-dark-accent/20 disabled:from-gray-400 disabled:to-gray-500 disabled:text-gray-200 disabled:shadow-none disabled:cursor-not-allowed"
            >
                Save Changes
            </button>
        </div>

        <div className="mt-6 pt-6 border-t border-black/10 dark:border-white/10 flex flex-col gap-3">
            <button
                onClick={onShowTour}
                className="w-full text-center text-light-accent dark:text-dark-accent font-semibold hover:underline"
            >
                Show App Tour
            </button>
        </div>
      </div>
    </div>
  );
};
