import { Helmet } from 'react-helmet-async';

function ExamSEO({ exam, examDetails, categoryName }) {
    const siteUrl = "https://examcreast.vercel.app";
    const examUrl = `${siteUrl}/exam/${exam?.slug}`;
    
    // Debug log to check if component is receiving data
    console.log('🔍 ExamSEO received:', { exam, examDetails });
    
    // ✅ Generate title with priority
    const getTitle = () => {
        // Priority 1: Custom meta_title from database
        if (exam?.meta_title && exam.meta_title.trim() !== '') {
            return exam.meta_title;
        }
        // Priority 2: Exam title from exam_details
        if (examDetails?.exam_title) {
            return `${examDetails.exam_title} - Complete Preparation Guide | TestHub`;
        }
        // Priority 3: Exam name from exams table
        if (exam?.name) {
            return `${exam.name} Exam - Mock Tests & Study Material | TestHub`;
        }
        // Priority 4: Default
        return "TestHub - India's Most Advanced Test Series Platform";
    };
    
    // ✅ Generate description with priority
    const getDescription = () => {
        if (exam?.meta_description && exam.meta_description.trim() !== '') {
            return exam.meta_description;
        }
        if (examDetails?.about_exam?.overview) {
            return examDetails.about_exam.overview.substring(0, 160);
        }
        if (exam?.description) {
            return exam.description;
        }
        return `Prepare for ${exam?.name || 'competitive exams'} with full-length mock tests, detailed analysis, and all India ranking. Crack your exam with TestHub's AI-powered test series.`;
    };
    
    // ✅ Generate keywords
    const getKeywords = () => {
        if (exam?.meta_keywords && exam.meta_keywords.trim() !== '') {
            return exam.meta_keywords;
        }
        const examName = exam?.name || '';
        const shortName = exam?.short_name || '';
        const category = categoryName || exam?.category_name || '';
        return `${examName}, ${shortName}, ${category}, mock test, test series, online preparation, exam guide, previous year papers, competitive exams`;
    };
    
    // ✅ Generate canonical URL
    const getCanonical = () => {
        return examUrl;
    };
    
    // ✅ Generate OG Image
    const getOgImage = () => {
        if (exam?.og_image) return exam.og_image;
        return `${siteUrl}/og-default.jpg`;
    };
    
    // ✅ Generate JSON-LD Schema
    const getSchema = () => {
        return {
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": getTitle(),
            "description": getDescription(),
            "url": examUrl,
            "mainEntity": {
                "@type": "EducationalOrganization",
                "name": exam?.name || "TestHub Exam",
                "description": getDescription(),
                "provider": {
                    "@type": "Organization",
                    "name": "TestHub",
                    "url": siteUrl
                }
            }
        };
    };
    
    // ✅ Generate Breadcrumb Schema
    const getBreadcrumbSchema = () => {
        return {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Home",
                    "item": siteUrl
                },
                {
                    "@type": "ListItem",
                    "position": 2,
                    "name": "Exams",
                    "item": `${siteUrl}/exams`
                },
                {
                    "@type": "ListItem",
                    "position": 3,
                    "name": exam?.name || "Exam",
                    "item": examUrl
                }
            ]
        };
    };
    
    // Debug: Print what will be rendered
    console.log('📝 SEO Tags being generated:', {
        title: getTitle(),
        description: getDescription(),
        keywords: getKeywords(),
        canonical: getCanonical()
    });
    
    return (
        <Helmet>
            {/* Basic Meta Tags */}
            <title>{getTitle()}</title>
            <meta name="description" content={getDescription()} />
            <meta name="keywords" content={getKeywords()} />
            <meta name="robots" content="index, follow" />
            
            {/* Canonical URL */}
            <link rel="canonical" href={getCanonical()} />
            
            {/* Open Graph / Facebook */}
            <meta property="og:title" content={getTitle()} />
            <meta property="og:description" content={getDescription()} />
            <meta property="og:url" content={examUrl} />
            <meta property="og:type" content="website" />
            <meta property="og:image" content={getOgImage()} />
            <meta property="og:site_name" content="TestHub" />
            <meta property="og:locale" content="en_IN" />
            
            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={getTitle()} />
            <meta name="twitter:description" content={getDescription()} />
            <meta name="twitter:image" content={getOgImage()} />
            
            {/* Article specific */}
            <meta property="article:section" content={categoryName || exam?.category_name || "Exams"} />
            <meta property="article:tag" content={getKeywords()} />
            
            {/* Additional SEO */}
            <meta name="author" content="TestHub" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            
            {/* JSON-LD Schema */}
            <script type="application/ld+json">
                {JSON.stringify(getSchema())}
            </script>
            <script type="application/ld+json">
                {JSON.stringify(getBreadcrumbSchema())}
            </script>
        </Helmet>
    );
}

export default ExamSEO;