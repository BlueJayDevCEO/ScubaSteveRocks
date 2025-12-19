{/* <SEOHead /> */}
import React from "react";
import { Helmet } from "react-helmet-async";

type SEOHeadProps = {
  title?: string;
  description?: string;
  canonicalUrl?: string;
};

export const SEOHead: React.FC<SEOHeadProps> = ({
  title = "Scuba Steve AI — Your AI Dive Buddy",
  description = "Identify marine life from photos, plan safer dives, and fix underwater colors — instantly. Built by divers for divers.",
  canonicalUrl = "https://www.scubasteve.rocks/",
}) => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Scuba Steve AI",
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    description,
    url: canonicalUrl,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />

      {/* OpenGraph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />

      {/* JSON-LD */}
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Helmet>
  );
};

