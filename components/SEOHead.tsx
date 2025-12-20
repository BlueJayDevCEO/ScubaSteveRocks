import React from "react";
import { Helmet } from "react-helmet-async";

export default function SEOHead() {
  return (
    <Helmet>
      <title>Scuba Steve</title>
      <meta name="description" content="Your AI Dive Buddy for the Ocean." />
    </Helmet>
  );
}
