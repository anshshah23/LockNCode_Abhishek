"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Shield, Menu, X } from "lucide-react";
import useGoogleTranslate from "@/hooks/useGoogleTranslate";
import { Button } from "@/components/ui/button";

export default function Navbar() {
    useGoogleTranslate(); // Initialize Google Translate
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 100);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Define your links dynamically
    const Links = [
        { name: "Home", link: "/" },
        { name: "Features", link: "#features" },
        { name: "How It Works", link: "#how-it-works" },
        { name: "Dashboard", link: "#dashboard" },
        { name: "API", link: "#api" },
    ];

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-muted transition-all duration-300 text-white ${isScrolled ? "shadow-md" : ""}`}>
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <Shield className="h-6 w-6 text-primary" />
                    <span className="font-bold text-xl">PhishGuard AI</span>
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-6">
                    {Links.map((link) => (
                        <Link key={link.name} href={link.link} className="text-sm hover:text-primary transition-colors">
                            {link.name}
                        </Link>
                    ))}
                    <Button>Get Started</Button>
                </nav>

                {/* Mobile Menu Toggle */}
                <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>

            {/* Mobile Navigation */}
            {isMenuOpen && (
                <div className="md:hidden absolute top-16 left-0 w-full bg-background shadow-lg border-t border-muted">
                    <div className="flex flex-col items-center gap-4 py-4">
                        {Links.map((link) => (
                            <Link 
                                key={link.name} 
                                href={link.link} 
                                className="text-sm hover:text-primary transition-colors" 
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {link.name}
                            </Link>
                        ))}
                        <Button onClick={() => setIsMenuOpen(false)}>Get Started</Button>
                    </div>
                </div>
            )}
        </header>
    );
}
