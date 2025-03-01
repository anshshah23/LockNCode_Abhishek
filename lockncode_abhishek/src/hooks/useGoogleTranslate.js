"use client";
import { useEffect } from "react";

export default function useGoogleTranslate() {
  useEffect(() => {
    if (window.googleTranslateElementInit) return;

    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: "hi,ta,te,bn,gu,kn,ml,mr,pa,or,as,en",
          autoDisplay: true,
          layout: google.translate.TranslateElement.InlineLayout.HORIZONTAL
        },
        "google_translate_element"
      );
    };

    const script = document.createElement("script");
    script.src =
      "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);
}