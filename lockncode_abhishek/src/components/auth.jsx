"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(null);
    const [user, setUser] = useState(null);
    const router = useRouter();

    // Redirects the user to Google OAuth
    const loginAndConnect = () => {
        const oauthEP = "https://accounts.google.com/o/oauth2/v2/auth";
        const params = new URLSearchParams({
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
            redirect_uri: process.env.NEXT_PUBLIC_FULL_BASE_DOMAIN,
            response_type: "token",
            scope: "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/gmail.readonly",
            include_granted_scopes: "true",
            state: "pass-through-value",
        });

        window.location.href = `${oauthEP}?${params.toString()}`;
    };

    // Stores token in localStorage and state
    const storeTokenInLS = (accessToken) => {
        setToken(accessToken);
        localStorage.setItem("authToken", accessToken);
    };

    // Fetches Gmail Emails
    const fetchEmails = async (accessToken) => {
        if (!accessToken) {
            console.error("Access token is missing!");
            return [];
        }

        try {
            const listResponse = await fetch(
                "https://www.googleapis.com/gmail/v1/users/me/messages",
                {
                    headers: { Authorization: `Bearer ${accessToken}` },
                }
            );

            if (!listResponse.ok) {
                console.error("Failed to fetch email list:", await listResponse.json());
                return [];
            }

            const listData = await listResponse.json();
            if (!listData.messages) return [];

            // Fetch individual email details
            const emailPromises = listData.messages.slice(0, 10).map(async (msg) => {
                const msgResponse = await fetch(
                    `https://www.googleapis.com/gmail/v1/users/me/messages/${msg.id}`,
                    {
                        headers: { Authorization: `Bearer ${accessToken}` },
                    }
                );
                return msgResponse.ok ? await msgResponse.json() : null;
            });

            const emailData = await Promise.all(emailPromises);
            return emailData.filter(Boolean);
        } catch (error) {
            console.error("Error fetching emails:", error);
            return [];
        }
    };

    // Fetches User Info
    const fetchUserInfo = async (accessToken) => {
        if (!accessToken) return;

        try {
            const response = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            if (response.ok) {
                const userInfo = await response.json();
                setUser(userInfo);
            } else {
                console.error("Failed to fetch user info:", await response.json());
            }
        } catch (error) {
            console.error("Error fetching user info:", error);
        }
    };

    // Logout Function
    const logout = async () => {
        if (token) {
            try {
                await fetch(`https://oauth2.googleapis.com/revoke?token=${token}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                });
            } catch (error) {
                console.error("Error revoking token:", error.message);
            }
        }

        setToken(null);
        setUser(null);
        localStorage.removeItem("authToken");
        router.push("/");
    };

    // Checks for Token on Page Load
    useEffect(() => {
        const localToken = localStorage.getItem("authToken");
        if (localToken) {
            setToken(localToken);
            fetchUserInfo(localToken);
        }

        const hash = window.location.hash;
        if (hash.includes("access_token")) {
            const urlParams = new URLSearchParams(hash.replace("#", ""));
            const accessToken = urlParams.get("access_token");

            if (accessToken) {
                storeTokenInLS(accessToken);
                fetchUserInfo(accessToken);
                window.history.replaceState(null, null, " ");
            }
        }
    }, []);

    return (
        <AuthContext.Provider value={{ token, user, loginAndConnect, fetchEmails, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook to use Authentication Context
export const useAuth = () => {
    const authContextValue = useContext(AuthContext);
    if (!authContextValue) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return authContextValue;
};
