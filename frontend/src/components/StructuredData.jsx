function StructuredData() {
    const schema = {
        "@context": "https://schema.org",
        "@type": "EducationalOrganization",
        "name": "TestHub",
        "url": "https://testhub-three.vercel.app",
        "logo": "https://testhub-three.vercel.app/logo.png",
        "description": "India's most advanced test series platform for competitive exams",
        "sameAs": [
            "https://facebook.com/testhub",
            "https://twitter.com/testhub",
            "https://instagram.com/testhub"
        ],
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "INR",
            "availability": "https://schema.org/OnlineOnly"
        }
    };
    
    return (
        <script type="application/ld+json">
            {JSON.stringify(schema)}
        </script>
    );
}

export default StructuredData;