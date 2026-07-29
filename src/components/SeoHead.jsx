import React, { useEffect } from 'react';

export default function SeoHead({ title, description, image, url }) {
  useEffect(() => {
    if (title) {
      document.title = `${title} — Nur & Hikmah Daily Reflections`;
    }

    const setMetaTag = (selector, content) => {
      let element = document.querySelector(selector);
      if (element) {
        element.setAttribute('content', content);
      }
    };

    if (description) {
      setMetaTag('meta[name="description"]', description);
      setMetaTag('meta[property="og:description"]', description);
      setMetaTag('meta[property="twitter:description"]', description);
    }

    if (title) {
      setMetaTag('meta[property="og:title"]', title);
      setMetaTag('meta[property="twitter:title"]', title);
    }

    if (image) {
      setMetaTag('meta[property="og:image"]', image);
      setMetaTag('meta[property="twitter:image"]', image);
    }

    if (url) {
      setMetaTag('meta[property="og:url"]', url);
    }
  }, [title, description, image, url]);

  return null;
}
