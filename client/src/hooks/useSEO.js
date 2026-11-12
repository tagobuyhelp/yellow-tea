'use client';
import { useEffect } from 'react';
export const useSEO = ({ title, description, keywords, image = '/uploads/site_logo.jpg', url = (typeof window !== 'undefined' ? window.location.href : 'https://yellowtea.in'), type = 'website' }) => {
    useEffect(() => {
        // Update document title
        document.title = title;
        // Update meta description
        let metaDescription = document.querySelector('meta[name="description"]');
        if (!metaDescription) {
            metaDescription = document.createElement('meta');
            metaDescription.setAttribute('name', 'description');
            document.head.appendChild(metaDescription);
        }
        metaDescription.setAttribute('content', description);
        // Update meta keywords
        if (keywords) {
            let metaKeywords = document.querySelector('meta[name="keywords"]');
            if (!metaKeywords) {
                metaKeywords = document.createElement('meta');
                metaKeywords.setAttribute('name', 'keywords');
                document.head.appendChild(metaKeywords);
            }
            metaKeywords.setAttribute('content', keywords);
        }
        // Update Open Graph tags
        const updateOGTag = (property, content) => {
            let ogTag = document.querySelector(`meta[property="og:${property}"]`);
            if (!ogTag) {
                ogTag = document.createElement('meta');
                ogTag.setAttribute('property', `og:${property}`);
                document.head.appendChild(ogTag);
            }
            ogTag.setAttribute('content', content);
        };
        updateOGTag('title', title);
        updateOGTag('description', description);
        updateOGTag('image', image);
        updateOGTag('url', url);
        updateOGTag('type', type);
        // Update Twitter Card tags
        const updateTwitterTag = (name, content) => {
            let twitterTag = document.querySelector(`meta[name="twitter:${name}"]`);
            if (!twitterTag) {
                twitterTag = document.createElement('meta');
                twitterTag.setAttribute('name', `twitter:${name}`);
                document.head.appendChild(twitterTag);
            }
            twitterTag.setAttribute('content', content);
        };
        updateTwitterTag('title', title);
        updateTwitterTag('description', description);
        updateTwitterTag('image', image);
        // Update canonical URL
        let canonical = document.querySelector('link[rel="canonical"]');
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.setAttribute('rel', 'canonical');
            document.head.appendChild(canonical);
        }
        canonical.setAttribute('href', url);
    }, [title, description, keywords, image, url, type]);
};
