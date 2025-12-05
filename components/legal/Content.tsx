import React from 'react';

const LegalSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-6">
        <h3 className="font-heading font-semibold text-2xl mb-2 text-light-accent dark:text-dark-accent">{title}</h3>
        <div className="space-y-3 text-base leading-relaxed">{children}</div>
    </div>
);

export const TermsOfUseContent: React.FC = () => (
    <div className="font-sans">
        <p className="mb-4 text-sm text-light-text/70 dark:text-dark-text/70">Last updated: {new Date().toLocaleDateString()}</p>

        <LegalSection title="1. Independent Product">
            <p>Scuba Steve AI™ by OSEA Diver™ is an independent digital product. It is not affiliated with, endorsed by, or connected to any major scuba certification agency such as PADI, SSI, NAUI, RAID, or DAN. Any references to these organizations are for educational or compatibility purposes only.</p>
        </LegalSection>

        <LegalSection title="2. AI-Powered Assistance">
            <p>Scuba Steve AI™ is an AI-powered assistant designed for educational and informational purposes. While we strive for accuracy, the AI may provide inaccurate or incomplete identifications and information. It is a tool to assist, not replace, expert knowledge.</p>
        </LegalSection>

        <LegalSection title="3. Not Professional Advice">
            <p>The outputs and information provided by Scuba Steve AI™ should not be treated as professional, scientific, or safety advice. Always consult with certified dive professionals, local experts, and official marine life guides before making any decisions related to diving, safety, or species interaction.</p>
        </LegalSection>
        
        <LegalSection title="4. Limitation of Liability">
            <p>OSEA Diver™ is not responsible for any decisions, actions, or consequences resulting from the use of information provided by Scuba Steve AI™. Users assume full responsibility for their interpretation and use of the AI's results.</p>
        </LegalSection>

        <LegalSection title="5. User-Generated Content">
            <p>Any content you upload (such as images, videos, and messages) remains your property. By uploading content, you grant OSEA Diver™ a non-exclusive, worldwide, royalty-free license to use, reproduce, and process this content for the purposes of:</p>
            <ul className="list-disc list-inside pl-4">
                <li>Providing the core features of the app (e.g., marine life identification).</li>
                <li>Improving the accuracy and capabilities of our AI models.</li>
                <li>Contributing to anonymized datasets for marine conservation research.</li>
            </ul>
        </LegalSection>

        <LegalSection title="6. User Conduct">
            <p>You agree not to upload any content that is harmful, illegal, offensive, or infringes on the copyrights or intellectual property of others. We reserve the right to remove any content and suspend users who violate these terms.</p>
        </LegalSection>

        <LegalSection title="7. Service Usage and Donations">
            <p>The core features of Scuba Steve AI™ are currently free to use, subject to fair usage limits. Optional premium features or voluntary donations may be offered. Donations are processed through third-party services (e.g., Stripe) and are non-refundable.</p>
        </LegalSection>
        
        <LegalSection title="8. Conservation Commitment">
            <p>OSEA Diver™ is committed to protecting our oceans. We donate up to 25% of all proceeds (from donations or future premium features) to verified marine-conservation partners. We publish donation summaries twice a year on our website for full transparency.</p>
        </LegalSection>
    </div>
);

export const PrivacyPolicyContent: React.FC = () => (
    <div className="font-sans">
         <p className="mb-4 text-sm text-light-text/70 dark:text-dark-text/70">Last updated: {new Date().toLocaleDateString()}</p>
        
        <LegalSection title="1. Information We Collect">
            <p>To provide and improve our service, we may collect the following information:</p>
            <ul className="list-disc list-inside pl-4">
                <li><strong>Uploaded Media:</strong> Photos and videos you upload for marine life identification or color correction.</li>
                <li><strong>Location Data:</strong> Geographic location if you voluntarily provide it in text prompts or if it's included in your media's metadata (EXIF data). You can disable this on your device.</li>
                <li><strong>Account Information:</strong> Your email address, display name, and profile picture if you sign in using a third-party provider like Google or Apple.</li>
                <li><strong>Usage Data:</strong> Anonymized data about your interactions with the app, such as which features you use.</li>
            </ul>
        </LegalSection>

        <LegalSection title="2. How We Use Your Information">
            <p>Your information is used solely for the following purposes:</p>
            <ul className="list-disc list-inside pl-4">
                <li>To perform marine life identification and other core app functions.</li>
                <li>To train and improve our AI models to provide more accurate results.</li>
                <li>To communicate with you about your account or app updates (if you subscribe).</li>
                <li>To contribute to anonymized marine research datasets to aid conservation efforts.</li>
            </ul>
        </LegalSection>

        <LegalSection title="3. Data Storage and Processing">
            <p>Your data is handled with care:</p>
             <ul className="list-disc list-inside pl-4">
                <li>Uploaded media and associated data may be stored on secure cloud platforms like Firebase and Google Cloud.</li>
                <li>Your data is processed by third-party AI systems (such as Google's Gemini) to generate identifications and other responses.</li>
                <li>We do not sell your personal data to third parties.</li>
            </ul>
        </LegalSection>

        <LegalSection title="4. Data Retention and Deletion">
            <p>You are in control of your data. We will delete your personal data and uploaded content upon request. We may retain anonymized data for research and model improvement purposes indefinitely. Inactive user data may be automatically deleted after a set retention period (e.g., 24 months).</p>
        </LegalSection>

         <LegalSection title="5. Contact Us">
            <p>If you have any questions about this Privacy Policy or wish to request data deletion, please contact us at <a href="mailto:scubasteve@scubasteve.rocks" className="text-light-accent dark:text-dark-accent hover:underline">scubasteve@scubasteve.rocks</a>.</p>
        </LegalSection>
    </div>
);