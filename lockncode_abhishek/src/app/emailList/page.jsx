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

const extractLinks = (html) => {
    if (!html) return [];
    const urlRegex = /https?:\/\/[^\s"<>\]]+/g;
    return html.match(urlRegex) || [];
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
            setCurrentIndex(0);
        } catch (error) {
            console.error("Error fetching emails:", error);
        }
        setLoading(false);
    };

    const currentEmail = emailData[currentIndex] || null;
    const emailBody = currentEmail ? cleanEmailBody(currentEmail.body) : "";
    const links = extractLinks(emailBody);

    return (
        <div className="w-full min-h-screen p-4 md:p-6 bg-zinc-950 text-white">
            <div className="flex flex-col md:flex-row items-center justify-between mb-6">
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

            {currentEmail ? (
                <div className="w-full max-w-screen mx-auto bg-zinc-900 p-6 rounded-lg shadow-lg">
                    <div className="space-y-4">
                        <Field label="Date & Time" value={formatDate(currentEmail.date)} />
                        <Field label="From" value={currentEmail.from} />
                        <Field label="Subject" value={currentEmail.subject} />

                        <div className="flex justify-between mt-6">
                            <Button
                                onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
                                disabled={currentIndex === 0}
                                className="bg-gray-700 text-white px-4 py-2 rounded-md flex items-center"
                            >
                                <ChevronLeft className="h-5 w-5 mr-2" /> Previous
                            </Button>

                            <Button
                                onClick={() => setCurrentIndex((prev) => Math.min(prev + 1, emailData.length - 1))}
                                disabled={currentIndex >= emailData.length - 1}
                                className="bg-gray-700 text-white px-4 py-2 rounded-md flex items-center"
                            >
                                Next <ChevronRight className="h-5 w-5 ml-2" />
                            </Button>
                        </div>

                        <Field label="Body" value={parse(emailBody)} />

                        {/* Attachments */}
                        {currentEmail.attachments && currentEmail.attachments.length > 0 && (
                            <Field
                                label="Attachments"
                                value={
                                    <ul className="list-disc pl-4">
                                        {currentEmail.attachments.map((file, index) => (
                                            <li key={index} className="break-all flex items-center">
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
                                            <li key={index} className="break-all">
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

                        {/* Malicious Links Box (Placeholder) */}
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

const Field = ({ label, value }) => (
    <div className="w-full">
        <label className="text-sm font-semibold">{label}</label>
        <div className="w-full bg-zinc-800 p-4 rounded-md border border-zinc-700 min-h-[50px]">
            {value}
        </div>
    </div>
);

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
