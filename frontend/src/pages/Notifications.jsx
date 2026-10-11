
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    // Fetch notifications from backend
    const fetchNotifications = useCallback(async () => {
        const token = localStorage.getItem("access_token");

        if (!token) {
            navigate("/login");
            return;
        }

        try {
            setLoading(true);
            setError("");

            const response = await api.get("notifications/");

            // Debug: Check API response in browser console
            console.log("Notifications API response:", response.data);

            const data = response.data;

            setNotifications(
                Array.isArray(data)
                    ? data
                    : Array.isArray(data.results)
                        ? data.results
                        : []
            );
        } catch (err) {
            // Debug: Check API errors
            console.error(
                "Notifications fetch error:",
                err.response?.data || err.message
            );

            if (err.response?.status === 401) {
                localStorage.removeItem("access_token");
                localStorage.removeItem("refresh_token");
                navigate("/login");
            } else {
                setError("Unable to load notifications.");
            }
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchNotifications();
        }, 0);

        return () => clearTimeout(timer);
    }, [fetchNotifications]);

    // Mark notification as read
    const markAsRead = async (notification) => {
        if (notification.is_read) {
            return;
        }

        try {
            await api.patch(
                `notifications/${notification.id}/read/`,
                { is_read: true }
            );

            setNotifications((previous) =>
                previous.map((item) =>
                    item.id === notification.id
                        ? { ...item, is_read: true }
                        : item
                )
            );
        } catch (err) {
            console.error(
                "Mark notification as read error:",
                err.response?.data || err.message
            );

            setError("Unable to mark notification as read.");
        }
    };

    const unreadCount = notifications.filter(
        (item) => !item.is_read
    ).length;

    return (
        <div style={styles.page}>
            <div style={styles.container}>

                {/* Header */}
                <div style={styles.header}>
                    <div>
                        <p style={styles.eyebrow}>
                            ALUMNILOOP
                        </p>

                        <h1 style={styles.title}>
                            Notifications
                        </h1>

                        <p style={styles.subtitle}>
                            Stay updated with your alumni network.
                        </p>
                    </div>

                    <div style={styles.count}>
                        {unreadCount} unread
                    </div>
                </div>

                {/* Loading */}
                {loading && (
                    <p style={styles.info}>
                        Loading notifications...
                    </p>
                )}

                {/* Error */}
                {!loading && error && (
                    <div style={styles.error}>
                        <p>{error}</p>

                        <button
                            type="button"
                            style={styles.retry}
                            onClick={fetchNotifications}
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* Empty state */}
                {!loading &&
                    !error &&
                    notifications.length === 0 && (
                        <div style={styles.empty}>
                            <div style={styles.bell}>
                                🔔
                            </div>

                            <h2>No notifications yet</h2>

                            <p>
                                New updates from your alumni network
                                will appear here.
                            </p>
                        </div>
                    )}

                {/* Notification list */}
                {!loading &&
                    !error &&
                    notifications.map((item) => (
                        <button
                            type="button"
                            key={item.id}
                            onClick={() => markAsRead(item)}
                            aria-label={`Notification: ${item.title}`}
                            style={{
                                ...styles.card,
                                background: item.is_read
                                    ? "#ffffff"
                                    : "#eff6ff",
                                borderLeft: item.is_read
                                    ? "4px solid #e2e8f0"
                                    : "4px solid #2563eb",
                            }}
                        >
                            <div style={styles.icon}>
                                {item.is_read ? "📩" : "🔔"}
                            </div>

                            <div style={styles.content}>
                                <h3 style={styles.cardTitle}>
                                    {item.title}
                                </h3>

                                <p style={styles.message}>
                                    {item.message}
                                </p>

                                <small style={styles.date}>
                                    {item.created_at
                                        ? new Date(
                                            item.created_at
                                        ).toLocaleString()
                                        : ""}
                                </small>
                            </div>

                            {!item.is_read && (
                                <span style={styles.dot}></span>
                            )}
                        </button>
                    ))}
            </div>
        </div>
    );
}

const styles = {
    page: {
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "32px 16px",
        fontFamily: "Arial, sans-serif",
    },

    container: {
        maxWidth: "850px",
        margin: "0 auto",
    },

    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "16px",
        marginBottom: "28px",
    },

    eyebrow: {
        color: "#2563eb",
        fontSize: "12px",
        fontWeight: "bold",
        letterSpacing: "2px",
    },

    title: {
        color: "#0f172a",
        fontSize: "32px",
        margin: "8px 0",
    },

    subtitle: {
        color: "#64748b",
        margin: 0,
    },

    count: {
        background: "#dbeafe",
        color: "#1d4ed8",
        padding: "10px 16px",
        borderRadius: "20px",
        fontWeight: "bold",
    },

    card: {
        width: "100%",
        display: "flex",
        alignItems: "flex-start",
        gap: "16px",
        padding: "20px",
        marginBottom: "12px",
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        textAlign: "left",
        cursor: "pointer",
        color: "#0f172a",
        fontFamily: "Arial, sans-serif",
    },

    icon: {
        fontSize: "24px",
    },

    content: {
        flex: 1,
        minWidth: 0,
    },

    cardTitle: {
        fontSize: "16px",
        margin: "0 0 8px",
    },

    message: {
        color: "#475569",
        margin: "0 0 10px",
        lineHeight: 1.5,
        overflowWrap: "anywhere",
    },

    date: {
        color: "#64748b",
    },

    dot: {
        width: "9px",
        height: "9px",
        flexShrink: 0,
        borderRadius: "50%",
        background: "#2563eb",
        marginTop: "6px",
    },

    empty: {
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "16px",
        padding: "48px 20px",
        textAlign: "center",
        color: "#64748b",
    },

    bell: {
        fontSize: "40px",
    },

    info: {
        color: "#64748b",
    },

    error: {
        color: "#b91c1c",
        background: "#fee2e2",
        padding: "16px",
        borderRadius: "10px",
    },

    retry: {
        padding: "8px 12px",
        border: "none",
        borderRadius: "6px",
        background: "#2563eb",
        color: "#ffffff",
        cursor: "pointer",
    },
};

