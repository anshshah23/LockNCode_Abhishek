"use client";
import { useState } from "react";
import { useAuth } from "../context/AuthProvider";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Inbox, RefreshCw } from "lucide-react";

function EmailTable() {
    const { token, fetchEmails } = useAuth();
    const [emails, setEmails] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch emails when button is clicked
    const loadEmails = async () => {
        if (!token) {
            console.error("User is not authenticated!");
            return;
        }

        setLoading(true);
        try {
            const emailData = await fetchEmails(token);
            setEmails(emailData || []);
        } catch (error) {
            console.error("Failed to fetch emails:", error);
        } finally {
            setLoading(false);
        }
    };

    // Helper function to extract email header values
    const getHeader = (email, headerName) => {
        return email.payload?.headers?.find((h) => h.name === headerName)?.value || "—";
    };

    // Format date to be readable
    const formatDate = (dateString) => {
        if (!dateString) return "—";
        return new Date(dateString).toLocaleString();
    };

    return (
        <div className="dark rounded-lg p-4" style={{ backgroundColor: "#1e1e2e" }}>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold" style={{ color: "#cdd6f4" }}>Your Inbox</h2>
                <Button
                    onClick={loadEmails}
                    disabled={loading}
                    style={{
                        backgroundColor: "#89b4fa",
                        color: "#1e1e2e",
                        borderRadius: "0.5rem",
                    }}
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

            {emails.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12" style={{ color: "#a6adc8" }}>
                    <Inbox className="h-12 w-12 mb-4" />
                    <p className="text-lg">No emails found</p>
                    <p className="text-sm">Click the button above to fetch your emails</p>
                </div>
            ) : (
                <Table>
                    <TableCaption style={{ color: "#a6adc8" }}>Your recent emails</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead>From</TableHead>
                            <TableHead>Subject</TableHead>
                            <TableHead>Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {emails.map((email) => (
                            <TableRow key={email.id}>
                                <TableCell>{getHeader(email, "From")}</TableCell>
                                <TableCell>{getHeader(email, "Subject")}</TableCell>
                                <TableCell>{formatDate(getHeader(email, "Date"))}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </div>
    );
}

export default EmailTable;
