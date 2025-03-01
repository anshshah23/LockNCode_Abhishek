"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Inbox, RefreshCw, ChevronLeft, ChevronRight, Paperclip } from "lucide-react";
import { useAuth } from "@/components/auth";
import parse from "html-react-parser";
import DOMPurify from "dompurify";
import OpenAI from "openai";

const cleanEmailBody = (html) => {
    if (!html) return "No content available";
    let sanitizedHtml = DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
    return sanitizedHtml.replace(/<\/?(html|head|body)[^>]*>/g, "");
};

const extractLinks = (html) => {
    if (html) {
        let sanitizedHtml = DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
        const parser = new DOMParser();
        const doc = parser.parseFromString(sanitizedHtml, "text/html");

        let links = [];

        doc.querySelectorAll("a").forEach((a) => {
            if (a.href) links.push(a.href);
        });

        doc.querySelectorAll("img, iframe, form").forEach((el) => {
            const src = el.getAttribute("src") || el.getAttribute("action");
            if (src) links.push(src);
        });
        return [...new Set(links)];
    }
    else {
        const urlRegex = /<https?:\/\/[^\s<>"]+>|https?:\/\/[^\s<>"]+/gi;
        const links = html.match(urlRegex) || [];
        return links.map(link => link.replace(/[<>]/g, ''));
    }
};

const openai = new OpenAI({ apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY, dangerouslyAllowBrowser: true });

async function detectEmailPhishing(subject, body) {
    try {
        const prompt = `You are an intelligent email security assistant. Analyze the provided email and determine if it is a phishing attempt.
        
        Follow these steps:
        1. Check the sender's domain.
        2. Look for urgency or fear-based language.
        3. Inspect links or attachments for suspicious patterns.
        4. Identify requests for sensitive information.
        5. Evaluate grammar, spelling, and sentence structure.
        6. Detect generic greetings.

        ✅ Return ONLY JSON in this format:
        {
            "isPhishing": true/false,
            "confidenceScore": 0-100,
            "phishingReasons": ["reason1", "reason2"],
            "suspiciousLinks": ["link1", "link2"],
            "suggestedAction": "Ignore/Delete" or "Legitimate Email"
        }

        Do NOT include any explanations, only return JSON.
        `;

        const emailText = `Subject: ${subject}\nBody: ${body}`;

        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                { role: "system", content: prompt },
                { role: "user", content: emailText }
            ],
            temperature: 0.3 // Lower temperature for better structured output
        });

        const messageContent = response.choices[0]?.message?.content?.trim();

        // ✅ Validate and attempt to parse JSON safely
        if (!messageContent) {
            console.error("OpenAI API returned an empty response");
            return {
                isPhishing: false,
                confidenceScore: 0,
                phishingReasons: ["API error or empty response"],
                suspiciousLinks: [],
                suggestedAction: "Unable to analyze",
            };
        }

        try {
            return JSON.parse(messageContent);
        } catch (parseError) {
            console.error("OpenAI API Response Parsing Error:", parseError, "Response:", messageContent);
            return {
                isPhishing: false,
                confidenceScore: 0,
                phishingReasons: ["Response parsing failed"],
                suspiciousLinks: [],
                suggestedAction: "Unable to analyze",
            };
        }
    } catch (error) {
        console.error("OpenAI API Request Failed:", error);

        return {
            isPhishing: false,
            confidenceScore: 0,
            phishingReasons: ["API request failed"],
            suspiciousLinks: [],
            suggestedAction: "Unable to analyze",
        };
    }
}

function EmailTable() {
    const { fetchEmails } = useAuth();
    const [emailData, setEmailData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [token, setToken] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [phishingResults, setPhishingResults] = useState({});

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
            setCurrentIndex(0); // Set the first email as the default selection
        } catch (error) {
            console.error("Error fetching emails:", error);
        }
        setLoading(false);
    };

    const currentEmail = emailData[currentIndex] || null;
    const emailBody = currentEmail ? cleanEmailBody(currentEmail.body) : "";
    const links = currentEmail ? extractLinks(currentEmail.body) : [];

    useEffect(() => {
        const analyzeCurrentEmail = async () => {
            if (emailData.length > 0 && currentIndex < emailData.length) {
                const currentEmail = emailData[currentIndex];

                // Prevent re-analyzing the same email
                if (!phishingResults[currentEmail.id]) {
                    const phishingResult = await detectEmailPhishing(currentEmail.subject, currentEmail.body);
                    setPhishingResults((prevResults) => ({
                        ...prevResults,
                        [currentEmail.id]: phishingResult,
                    }));
                }
            }
        };

        analyzeCurrentEmail();
    }, [currentIndex, emailData]);

    return (
        <div className="w-full min-h-screen p-4 md:p-6 bg-slate-900 text-white">
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
                        <Field
                            label="Phishing Analysis"
                            value={
                                currentEmail && phishingResults[currentEmail.id] ? (
                                    <div>
                                        <p><strong>Is Phishing:</strong> {phishingResults[currentEmail.id].isPhishing ? "Yes" : "No"}</p>
                                        <p><strong>Confidence Score:</strong> {phishingResults[currentEmail.id].confidenceScore}%</p>
                                    </div>
                                ) : "Analyzing..."
                            }
                        />

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
