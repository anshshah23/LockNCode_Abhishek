"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Shield, Menu, X } from "lucide-react";
import useGoogleTranslate from "@/hooks/useGoogleTranslate";
import { Button } from "@/components/ui/button";
import { useAuth } from "./auth";
import "@/styles/nav.css";

function Navbar() {
    useGoogleTranslate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const { loginAndConnect, logout } = useAuth();
    const [token, setToken] = useState(null);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 100);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const authToken = localStorage.getItem("authToken");
            setToken(authToken);
        }
    }, []);

    const Links = [
        { name: "Home", link: "/" },
        { name: "Features", link: "/features" },
        { name: "Analytics", link: "/analytics" },
    ];

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-muted transition-all duration-300 text-white ${
                isScrolled ? "shadow-md" : ""
            }`}
        >
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Shield className="h-6 w-6 text-primary" />
                    <span className="font-bold text-xl">
                        <Link href="/">PhishNet AI</Link>
                    </span>
                </div>

                <nav className="hidden md:flex items-center gap-6">
                    {Links.map((link) => (
                        <Link key={link.name} href={link.link} className="text-lg hover:text-primary transition-colors">
                            {link.name}
                        </Link>
                    ))}

                    {!token ? (
                        <button className="button" onClick={loginAndConnect}>
                            Sign In
                        </button>
                    ) : (
                        <button onClick={logout} className="button">
                            Sign Out
                        </button>
                    )}
                </nav>

                {/* Mobile Menu Toggle */}
                <div className="md:hidden">
                    <Button onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </Button>
                </div>
            </div>

            {/* Mobile Navigation */}
            {isMenuOpen && (
                <div className="md:hidden absolute top-17 left-0 w-full bg-slate-950 h-screen shadow-lg border-t border-muted">
                    <div className="flex flex-col items-center gap-4 py-4 h-full justify-start">
                        {Links.map((link) => (
                            <Link
                                key={link.name}
                                href={link.link}
                                className="text-lg hover:text-primary transition-colors"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {link.name}
                            </Link>
                        ))}

                        {/* Conditionally show buttons */}
                        {!token ? (
                            <button className="button" onClick={loginAndConnect}>
                                Sign In
                            </button>
                        ) : (
                            <button onClick={logout} className="button">
                                Sign Out
                            </button>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}

export default Navbar;
