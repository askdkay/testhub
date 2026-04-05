import { Helmet } from 'react-helmet-async';

function SEO({ title, description, keywords, image, url }) {
    const siteTitle = "TestHub - India's Test Series Platform";
    const siteUrl = "https://testhub-three.vercel.app";
    
    return (
        <Helmet>
            <title>{title ? `${title} | TestHub` : siteTitle}</title>
            <meta name="description" content={description || "Prepare for competitive exams with India's most advanced test series platform."} />
            <meta name="keywords" content={keywords || "test series, competitive exams, SSC CGL, UPSC, Banking, Railway, mock test"} />
            
            {/* Open Graph */}
            <meta property="og:title" content={title || siteTitle} />
            <meta property="og:description" content={description || "Prepare for competitive exams with AI-powered test series."} />
            <meta property="og:url" content={url || siteUrl} />
            <meta property="og:type" content="website" />
            <meta property="og:image" content={image || `${siteUrl}/og-image.jpg`} />
            
            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title || siteTitle} />
            <meta name="twitter:description" content={description || "Crack your dream exam with TestHub!"} />
            <meta name="twitter:image" content={image || `${siteUrl}/twitter-image.jpg`} />
            
            {/* Canonical */}
            <link rel="canonical" href={url || siteUrl} />
        </Helmet>
    );
}

export default SEO;