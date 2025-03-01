"use client";
import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(null);
    const router = useRouter();

    const loginAndConnect = async () => {
        console.log("loginAndConnect");
        const oauthEP = "https://accounts.google.com/o/oauth2/v2/auth";
        const params = new URLSearchParams({
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
            redirect_uri: process.env.NEXT_PUBLIC_FULL_BASE_DOMAIN,
            response_type: "token",
            scope: "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/gmail.readonly",
            include_granted_scopes: "true",
            state: "pass-through-value"
        });
        window.location.href = `${oauthEP}?${params.toString()}`;
    };

    useEffect(() => {
        const localToken = localStorage.getItem('authToken');
        if (localToken) {
            setToken(localToken);
            fetchEmails(localToken); // Fetch emails if token exists
        }
        const hash = window.location.hash;
        if (hash.includes('access_token')) {
            const urlParams = new URLSearchParams(hash.replace('#', ''));
            const accessToken = urlParams.get('access_token');
            if (accessToken) {
                storeTokenInLS(accessToken);
                fetchEmails(accessToken); // Fetch emails after storing token
                window.history.replaceState(null, null, ' ');
            }
        }
    }, []);

    const storeTokenInLS = (serverToken) => {
        setToken(serverToken);
        localStorage.setItem('authToken', serverToken);
    };

    const base64Decode = (data) => {
        return Buffer.from(data, 'base64').toString('utf-8');
    };

    const extractAttachments = async (parts, attachments, messageId, accessToken) => {
        for (const part of parts) {
            if (part.filename && part.filename.length > 0 && part.body?.attachmentId) {
                const attachmentResponse = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/attachments/${part.body.attachmentId}`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        Accept: 'application/json'
                    }
                });

                if (attachmentResponse.ok) {
                    const attachmentData = await attachmentResponse.json();
                    attachments.push({
                        filename: part.filename,
                        mimeType: part.mimeType,
                        data: base64Decode(attachmentData.data)
                    });
                }
            }
            if (part.parts) {
                await extractAttachments(part.parts, attachments, messageId, accessToken);
            }
        }
    };

    const extractEmailData = async (email, accessToken) => {
        const headers = email.payload.headers;

        const subject = headers.find(header => header.name === 'Subject')?.value || '';
        const from = headers.find(header => header.name === 'From')?.value || '';
        const date = headers.find(header => header.name === 'Date')?.value || '';

        let body = '';
        let attachments = [];

        if (email.payload.parts) {
            const textPart = email.payload.parts.find(part => part.mimeType === 'text/plain');
            if (textPart && textPart.body?.data) {
                body = base64Decode(textPart.body.data);
            }
            await extractAttachments(email.payload.parts, attachments, email.id, accessToken);
        } else if (email.payload.body?.data) {
            body = base64Decode(email.payload.body.data);
        }

        return {
            subject,
            from,
            body,
            date,
            attachments
        };
    };

    const fetchEmails = async (accessToken) => {
        try {
            const listResponse = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages', {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    Accept: 'application/json'
                }
            });

            if (!listResponse.ok) {
                throw new Error(`Failed to fetch email list: ${listResponse.statusText}`);
            }

            const listData = await listResponse.json();

            if (listData.messages) {
                const emailPromises = listData.messages.map(async (msg) => {
                    const msgResponse = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`, {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                            Accept: 'application/json'
                        }
                    });

                    if (!msgResponse.ok) {
                        console.warn(`Failed to fetch email with ID ${msg.id}`);
                        return null;
                    }

                    const emailJson = await msgResponse.json();
                    return await extractEmailData(emailJson, accessToken);
                });

                const emailData = (await Promise.all(emailPromises)).filter(email => email !== null);
                return emailData;
            } else {
                console.log('No emails found.');
                return [];
            }
        } catch (error) {
            console.error('Error fetching emails:', error);
            return [];
        }
    };


    const logout = async () => {
        console.log("logout");
        if (token) {
            try {
                await fetch(`https://oauth2.googleapis.com/revoke?token=${token}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                });
            } catch (error) {
                console.error('Error revoking token:', error.message);
            }
        }
        setToken(null);
        localStorage.removeItem('authToken');
        router.push('/');
    };

    return (
        <AuthContext.Provider value={{ loginAndConnect, storeTokenInLS, logout, fetchEmails }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const authContextValue = useContext(AuthContext);
    if (!authContextValue) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return authContextValue;
};