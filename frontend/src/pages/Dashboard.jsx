
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        const token = localStorage.getItem("access_token");

        if (!token) {
          navigate("/login");
          return;
        }

        const response = await api.get("my-profile/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (isMounted) {
          setProfile(response.data);
        }
      } catch (error) {
        console.error("Dashboard profile error:", error);

        if (!isMounted) return;

        if (
          error.response?.status === 401 ||
          error.response?.status === 403
        ) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          navigate("/login");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  // Fetch dashboard notifications
  useEffect(() => {
    let isMounted = true;

    const loadNotifications = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) return;

      try {
        const response = await api.get("notifications/");
        console.log("Dashboard notifications:", response.data);

        const data = response.data;
        const items = Array.isArray(data)
          ? data
          : Array.isArray(data.results)
            ? data.results
            : [];

        if (isMounted) {
          setNotifications(items);
        }
      } catch (error) {
        console.error(
          "Dashboard notifications error:",
          error.response?.data || error.message
        );
      }
    };

    loadNotifications();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/login");
  };

  const isAdmin =
    profile?.role?.toLowerCase() === "admin";

  const unreadCount = notifications.filter(
    (item) => !item.is_read
  ).length;

  const features = [
    {
      title: "Profile",
      description: "Update your profile, skills and achievements.",
      icon: "👤",
      color: "blue",
      path: "/profile",
    },
    {
      title: "Search Alumni",
      description: "Discover and connect with alumni from your college.",
      icon: "👥",
      color: "purple",
      path: "/search-alumni",
    },
    {
      title: "Posts",
      description: "Share updates, ideas and achievements.",
      icon: "📝",
      color: "pink",
      path: "/posts",
    },
    {
      title: "Jobs / Opportunities",
      description: "Explore internships, jobs and career opportunities.",
      icon: "💼",
      color: "green",
      path: "/jobs",
    },
    {
      title: "Mentorship",
      description: "Learn and grow with experienced alumni.",
      icon: "🎓",
      color: "orange",
      path: "/mentorship",
    },
    {
      title: "Messages",
      description: "Chat with your connections and alumni.",
      icon: "💬",
      color: "indigo",
      path: "/messages",
    },
  ];

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <h3>Preparing your dashboard...</h3>
        <p>Connecting you with your alumni community.</p>
      </div>
    );
  }

  return (
    <div className="alumni-dashboard">
      <aside className="dashboard-sidebar">
        <div className="sidebar-brand">
          <span className="brand-icon">🎓</span>
          <div>
            <h2>Alumni Network</h2>
            <p>Connect. Learn. Grow.</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            className="sidebar-link active"
            onClick={() => navigate("/dashboard")}
          >
            <span>🏠</span> Dashboard
          </button>

          {features.map((item) => (
            <button
              className="sidebar-link"
              key={item.path}
              onClick={() => navigate(item.path)}
            >
              <span>{item.icon}</span>
              {item.title}
            </button>
          ))}

          {/* Notifications link */}
          <button
            className="sidebar-link"
            onClick={() => navigate("/notifications")}
          >
            <span>🔔</span>
            Notifications
            {unreadCount > 0 && (
              <span style={styles.badge}>
                {unreadCount}
              </span>
            )}
          </button>

          {isAdmin && (
            <button
              className="sidebar-link admin-link"
              onClick={() => navigate("/admin-dashboard")}
            >
              <span>🛡️</span> Admin Dashboard
            </button>
          )}
        </nav>

        <div className="sidebar-footer">
          <div>🌟</div>
          <p>Stay Connected</p>
          <p>Build Your Future</p>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <div>
            <span className="topbar-label">YOUR COMMUNITY</span>
            <h2>Dashboard</h2>
          </div>

          <div style={styles.topbarActions}>
            {/* Notification button */}
            <button
              type="button"
              style={styles.notificationButton}
              onClick={() => navigate("/notifications")}
              aria-label={`Notifications, ${unreadCount} unread`}
            >
              🔔
              {unreadCount > 0 && (
                <span style={styles.notificationBadge}>
                  {unreadCount}
                </span>
              )}
            </button>

            <div className="topbar-user">
              <span className="user-avatar">👤</span>
              <div>
                <strong>
                  {profile?.full_name || "Welcome"}
                </strong>
                <span>
                  {profile?.role || "Member"}
                </span>
              </div>
            </div>
          </div>
        </header>

        <section className="dashboard-hero">
          <div className="hero-content">
            <span className="hero-eyebrow">
              YOUR FUTURE STARTS HERE
            </span>

            <h1>
              Alumni Networking
              <br />
              Platform
            </h1>

            <p>
              Connect with alumni, discover opportunities,
              and build meaningful professional relationships.
            </p>

            <button
              className="hero-button"
              onClick={() => navigate("/search-alumni")}
            >
              Explore Alumni <span>→</span>
            </button>
          </div>
        </section>

        <section className="welcome-panel">
          <div className="welcome-avatar">🎓</div>

          <div className="welcome-text">
            <span className="welcome-small">NICE TO SEE YOU!</span>
            <h2>
              Welcome, {profile?.full_name || "Member"}!
            </h2>
            <p>Keep connecting and building your network.</p>
            <span className="role-badge">
              {profile?.role || "Member"}
            </span>
          </div>

          <div className="welcome-decoration">✦</div>
        </section>

        {/* Latest notifications */}
        <section style={styles.notificationsSection}>
          <div style={styles.notificationsHeading}>
            <div>
              <span style={styles.sectionEyebrow}>
                YOUR UPDATES
              </span>
              <h2 style={styles.notificationsTitle}>
                Recent Notifications
              </h2>
            </div>

            <button
              type="button"
              style={styles.viewAllButton}
              onClick={() => navigate("/notifications")}
            >
              View all →
            </button>
          </div>

          {notifications.length === 0 ? (
            <p style={styles.noNotifications}>
              No notifications yet.
            </p>
          ) : (
            notifications.slice(0, 3).map((item) => (
              <button
                type="button"
                key={item.id}
                style={{
                  ...styles.notificationCard,
                  background: item.is_read ? "#ffffff" : "#eff6ff",
                }}
                onClick={() => navigate("/notifications")}
              >
                <span style={styles.notificationIcon}>
                  {item.is_read ? "📩" : "🔔"}
                </span>

                <span style={styles.notificationText}>
                  <strong>{item.title}</strong>
                  <span>{item.message}</span>
                  <small>
                    {item.created_at
                      ? new Date(item.created_at).toLocaleString()
                      : ""}
                  </small>
                </span>

                {!item.is_read && (
                  <span style={styles.unreadDot}></span>
                )}
              </button>
            ))
          )}
        </section>

        <section className="section-heading">
          <div>
            <span className="section-eyebrow">YOUR NETWORK</span>
            <h2>Explore Your Community</h2>
          </div>
          <p>Everything you need, all in one place.</p>
        </section>

        <section className="feature-grid">
          {features.map((item) => (
            <button
              className={`feature-card ${item.color}`}
              key={item.path}
              onClick={() => navigate(item.path)}
            >
              <div className="feature-card-top">
                <span className="feature-icon">{item.icon}</span>
                <span className="feature-arrow">↗</span>
              </div>

              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <span className="feature-action">Explore feature →</span>
            </button>
          ))}
        </section>

        {isAdmin && (
          <button
            className="admin-card"
            onClick={() => navigate("/admin-dashboard")}
          >
            <span className="admin-card-icon">🛡️</span>
            <span className="admin-card-text">
              <strong>Admin Dashboard</strong>
              <small>
                Manage users and oversee the platform.
              </small>
            </span>
            <span className="admin-card-arrow">→</span>
          </button>
        )}

        <section className="dashboard-quote">
          <span>“</span>
          <p>
            Great careers are built on great connections.
          </p>
          <span>”</span>
        </section>

        <footer className="dashboard-footer">
          <span>Alumni Networking Platform</span>
          <span>Connect • Learn • Grow</span>

          <button
            className="logout-button"
            onClick={handleLogout}
          >
            ↪ Logout
          </button>
        </footer>
      </main>
    </div>
  );
}

const styles = {
  topbarActions: {
    display: "flex",
    alignItems: "center",
    gap: "18px",
  },

  notificationButton: {
    position: "relative",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    background: "#ffffff",
    padding: "10px 13px",
    fontSize: "22px",
    cursor: "pointer",
  },

  notificationBadge: {
    position: "absolute",
    top: "-7px",
    right: "-7px",
    minWidth: "19px",
    height: "19px",
    padding: "0 4px",
    borderRadius: "12px",
    background: "#dc2626",
    color: "#ffffff",
    fontSize: "11px",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  badge: {
    marginLeft: "auto",
    background: "#dc2626",
    color: "#ffffff",
    borderRadius: "12px",
    padding: "2px 7px",
    fontSize: "12px",
    fontWeight: "bold",
  },

  notificationsSection: {
    margin: "30px 0",
    padding: "24px",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    background: "#ffffff",
  },

  notificationsHeading: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "18px",
  },

  sectionEyebrow: {
    color: "#2563eb",
    fontSize: "12px",
    fontWeight: "bold",
    letterSpacing: "1.5px",
  },

  notificationsTitle: {
    margin: "7px 0 0",
    fontSize: "23px",
    color: "#0f172a",
  },

  viewAllButton: {
    border: "none",
    background: "transparent",
    color: "#2563eb",
    fontWeight: "bold",
    cursor: "pointer",
    padding: "8px",
  },

  noNotifications: {
    color: "#64748b",
    padding: "12px 0",
  },

  notificationCard: {
    width: "100%",
    display: "flex",
    alignItems: "flex-start",
    gap: "14px",
    textAlign: "left",
    padding: "16px",
    marginBottom: "10px",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    cursor: "pointer",
    color: "#0f172a",
  },

  notificationIcon: {
    fontSize: "23px",
  },

  notificationText: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    overflowWrap: "anywhere",
  },

  unreadDot: {
    width: "9px",
    height: "9px",
    borderRadius: "50%",
    background: "#2563eb",
    flexShrink: 0,
    marginTop: "5px",
  },
};

export default Dashboard;
