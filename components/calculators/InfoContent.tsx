
import React from 'react';

export const InfoSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-6">
        <h3 className="font-heading font-semibold text-xl mb-2 text-light-accent dark:text-dark-accent">{title}</h3>
        <div className="space-y-3 text-base leading-relaxed">{children}</div>
    </div>
);

export const Formula: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="p-4 bg-light-bg dark:bg-dark-bg rounded-lg my-4 text-center font-mono text-lg text-light-accent dark:text-dark-accent overflow-x-auto">
        <code>{children}</code>
    </div>
);
