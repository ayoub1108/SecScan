
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  twitterCard?: 'summary' | 'summary_large_image';
  children?: React.ReactNode;
}

export const SEO = ({
  title,
  description = "AI-powered security scanning for your code repositories. Detect vulnerabilities and secure your applications.",
  keywords = "security scanner, code security, AI, OpenAI, vulnerability detection",
  ogImage = "/og-image.png",
  ogType = "website",
  twitterCard = "summary_large_image",
  children,
}: SEOProps) => {
  // Ensure title ends with site name
  const fullTitle = title.includes('Agentic Security Scanner') 
    ? title 
    : `${title} | Agentic Security Scanner`;
  
  return (
    <Helmet>
      {/* Basic Metadata */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      
      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* Additional metadata provided by children */}
      {children}
    </Helmet>
  );
};
