
import React from 'react';
import { SkeletonLoader } from './SkeletonLoader';

export const SightingMapSkeleton: React.FC = () => {
    return (
        <div className="w-full animate-fade-in">
            <div className="bg-light-bg dark:bg-dark-bg p-4 rounded-lg">
                <SkeletonLoader type="line" width="50%" height="24px" className="mb-3" />
                <div className="space-y-2">
                    <SkeletonLoader type="line" width="90%" height="16px" />
                    <SkeletonLoader type="line" width="80%" height="16px" />
                </div>
            </div>
            <div className="mt-6">
                <SkeletonLoader type="line" width="30%" height="20px" className="mb-3" />
                <div className="space-y-2">
                    <SkeletonLoader type="block" className="w-full h-16" />
                    <SkeletonLoader type="block" className="w-full h-16" />
                    <SkeletonLoader type="block" className="w-full h-16" />
                </div>
            </div>
        </div>
    );
};
