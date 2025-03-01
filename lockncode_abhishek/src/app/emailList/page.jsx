"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Inbox, RefreshCw, ChevronLeft, ChevronRight, Paperclip } from "lucide-react";
import { useAuth } from "@/components/auth";
import parse from "html-react-parser";
import DOMPurify from "dompurify";

const cleanEmailBody = (html) => {
    if (!html) return "No content available";
    let sanitizedHtml = DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
    return sanitizedHtml.replace(/<\/?(html|head|body)[^>]*>/g, "");
};


const extractLinks = (data) => {
    const isHtml = /<(\/?)(a|img|iframe|div|span|p|form|b|i|strong|ul|li|table|td|th|h[1-6])[ >]/i.test(data);
    if (isHtml) {
        let sanitizedHtml = DOMPurify.sanitize(data, { USE_PROFILES: { html: true } });
        const parser = new DOMParser();
        const doc = parser.parseFromString(sanitizedHtml, "text/html");

        let links = [];

        doc.querySelectorAll("a").forEach((a) => {
            if (a.href) links.push(a.href);
        });
        return [...new Set(links)];
    }
    else {
        const urlRegex = /<https?:\/\/[^\s<>"]+>|https?:\/\/[^\s<>"]+/gi;
        const links = data.match(urlRegex) || [];
        return links.map(link => link.replace(/[<>]/g, ''));
    }
};


function EmailTable() {
    const { fetchEmails } = useAuth();
    const [emailData, setEmailData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [token, setToken] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (typeof window !== "undefined") {
            setToken(localStorage.getItem("authToken"));
        }
    }, []);

    useEffect(() => {
        if (token) loadEmails();
    }, [token]);

    const loadEmails = async () => {
        if (!token) return;
        setLoading(true);
        try {
            let data = await fetchEmails(token);
            data = data.sort((a, b) => new Date(b.date) - new Date(a.date));
            setEmailData(data);
            data.map((email, index) => {
                const isHtml = /<(\/?)(a|img|iframe|div|span|p|form|b|i|strong|ul|li|table|td|th|h[1-6])[ >]/i.test(email.body);
                console.log("isHtml", isHtml);
                console.log(email.body);
            });
            setCurrentIndex(0);
        } catch (error) {
            console.error("Error fetching emails:", error);
        }
        setLoading(false);
    };
    

    const currentEmail = emailData[currentIndex] || null;
    const emailBody = currentEmail ? cleanEmailBody(currentEmail.body) : "";
    const links = currentEmail ? extractLinks(currentEmail.body) : [];

    return (
        <div className="w-full min-h-screen p-4 md:p-6 bg-zinc-950 text-white">
            {/* Inbox Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pt-14">
                <h2 className="text-2xl font-bold">Your Inbox</h2>
                <Button
                    onClick={loadEmails}
                    disabled={loading}
                    className="bg-[#89b4fa] text-[#1e1e2e] rounded-md px-4 py-2 flex items-center"
                >
                    {loading ? (
                        <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Loading...
                        </>
                    ) : (
                        <>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Fetch Emails
                        </>
                    )}
                </Button>
            </div>

            {/* Email Content */}
            {currentEmail ? (
                <div className="w-full max-w-screen bg-zinc-900 p-6 rounded-lg shadow-lg">
                    <div className="space-y-4">
                        <Field label="Date & Time" value={formatDate(currentEmail.date)} />
                        <Field label="From" value={currentEmail.from} />
                        <Field label="Subject" value={currentEmail.subject} />

                        {/* Navigation Buttons */}
                        <div className="flex flex-col md:flex-row justify-between gap-4 mt-6">
                            <Button
                                onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
                                disabled={currentIndex === 0}
                                className="bg-gray-700 text-white px-4 py-2 rounded-md flex items-center justify-center w-full md:w-auto"
                            >
                                <ChevronLeft className="h-5 w-5 mr-2" /> Previous
                            </Button>

                            <Button
                                onClick={() => setCurrentIndex((prev) => Math.min(prev + 1, emailData.length - 1))}
                                disabled={currentIndex >= emailData.length - 1}
                                className="bg-gray-700 text-white px-4 py-2 rounded-md flex items-center justify-center w-full md:w-auto"
                            >
                                Next <ChevronRight className="h-5 w-5 ml-2" />
                            </Button>
                        </div>

                        {/* Email Body */}
                        <div className="w-full overflow-x-auto">
                            <Field label="Body" className="overflow-x-auto break-words" value={parse(emailBody)} />
                        </div>

                        {/* Attachments */}
                        {currentEmail.attachments && currentEmail.attachments.length > 0 && (
                            <Field
                                label="Attachments"
                                value={
                                    <ul className="list-disc pl-4">
                                        {currentEmail.attachments.map((file, index) => (
                                            <li key={index} className="break-words flex items-center">
                                                <Paperclip className="h-4 w-4 mr-2" />
                                                <a
                                                    href={file.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-400 hover:underline"
                                                >
                                                    {file.filename}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                }
                            />
                        )}

                        {/* Links Found */}
                        <Field
                            label="Links Found"
                            value={
                                links.length > 0 ? (
                                    <ul className="list-disc pl-4">
                                        {links.map((link, index) => (
                                            <li key={index} className="break-words">
                                                <a
                                                    href={link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-400 hover:underline"
                                                >
                                                    {link}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    "No links found"
                                )
                            }
                        />

                        {/* Malicious Links Placeholder */}
                        <Field label="Potential Malicious Links" value="(Pending analysis...)" />
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-12 text-white min-h-screen">
                    <Inbox className="h-12 w-12 mb-4" />
                    <p className="text-lg">No emails found</p>
                    <p className="text-sm text-gray-300">Click the button above to fetch your emails</p>
                </div>
            )}
        </div>
    );
}

/* Reusable Field Component */
const Field = ({ label, value }) => (
    <div className="w-full">
        <label className="text-sm font-semibold">{label}</label>
        <div className="w-full bg-zinc-800 p-4 rounded-md border border-zinc-700 min-h-[50px] break-words">
            {value}
        </div>
    </div>
);

/* Date Formatting */
const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

export default EmailTable;
