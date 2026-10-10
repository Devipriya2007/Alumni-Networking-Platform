
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/login");
  };

  const isAdmin =
    profile?.role?.toLowerCase() === "admin";

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

export default Dashboard;
