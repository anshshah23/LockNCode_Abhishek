"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { LogOut, Menu, X } from "lucide-react";
import useGoogleTranslate from "@/hooks/useGoogleTranslate";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function Navbar() {
    useGoogleTranslate(); // Initialize Google Translate
    const { user } = useUser();
    const { signOut } = useClerk();
    const [isOpen, setIsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 100);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const Links = [
        { name: "Home", link: "/" },
    ];

    return (
        <nav className={`fixed w-full z-50 text-white transition-all duration-300 ${isOpen ? "bg-black" : isScrolled ? "bg-gradient-to-b from-black to-black/10 backdrop-blur-sm border-white duration-300" : "bg-gradient-to-b from-black to-transparent"}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href="/" className="text-xl font-bold">
                        No-Phish
                    </Link>

                    {/* Desktop Links */}
                    <div className="hidden md:flex space-x-12">
                        {Links.map((link) => (
                            <div key={link.name} className="relative group">
                                <Link key={link.name} href={link.link} className="text-white">
                                    {link.name}
                                </Link>
                                <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
                            </div>
                        ))}
                    </div>

                    {/* Right Section (User Profile & Auth Buttons) */}
                    <div className="flex items-center gap-4">
                        {user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                        <Avatar>
                                            <AvatarImage src={user.imageUrl} alt="User avatar" />
                                            <AvatarFallback>{user.firstName?.charAt(0) || "U"}</AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => signOut()}>
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Sign out</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <div className="hidden md:flex space-x-2">
                                <Button variant="ghost" asChild>
                                    <Link href="/sign-in">Sign In</Link>
                                </Button>
                                <Button variant="outline text-black hover:bg-black hover:text-white" asChild>
                                    <Link href="/sign-up">Sign Up</Link>
                                </Button>
                            </div>
                        )}

                        {/* Google Translate (Hidden on Mobile) */}
                        <div className="hidden sm:block" id="google_translate_element"></div>

                        {/* Mobile Menu Button */}
                        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
                            {isOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Dropdown Menu */}
            <div
                className={`fixed top-16 left-0 w-full h-screen bg-black text-white md:hidden transition-opacity duration-300 ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
            >
                <div className="flex flex-col items-center py-6 space-y-4">
                    {Links.map((link) => (
                        <Link
                            key={link.name}
                            href={link.link}
                            className="text-lg font-medium relative group"
                            onClick={() => setIsOpen(false)} // Close menu on click
                        >
                            {link.name}
                        </Link>
                    ))}
                    {!user && (
                        <div className="flex flex-col items-center space-y-3 mt-4 w-full">
                            <Button variant="ghost" asChild className="w-3/4 text-center">
                                <Link href="/sign-in" onClick={() => setIsOpen(false)}>Sign In</Link>
                            </Button>
                            <Button variant="outline" asChild className="w-3/4 text-center">
                                <Link href="/sign-up" onClick={() => setIsOpen(false)}>Sign Up</Link>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
