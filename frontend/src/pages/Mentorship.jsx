
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Mentorship() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [alumni, setAlumni] = useState([]);
  const [requests, setRequests] = useState([]);

  const [selectedAlumni, setSelectedAlumni] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isStudent = profile?.role === "student";
  const isAlumni = profile?.role === "alumni";
  const isAdmin = profile?.role === "admin";

  const getId = (value) => {
    if (value && typeof value === "object") {
      return value.id;
    }

    return value;
  };

  const getName = (value) => {
    if (value && typeof value === "object") {
      return (
        value.full_name ||
        value.username ||
        `User #${value.id}`
      );
    }

    return `User #${value}`;
  };

  const getStatusStyle = (status) => {
    const stylesByStatus = {
      pending: {
        background: "#fff4d8",
        color: "#956500",
      },
      accepted: {
        background: "#dff7e9",
        color: "#167447",
      },
      rejected: {
        background: "#ffe5e5",
        color: "#b8323b",
      },
    };

    return (
      stylesByStatus[status] || {
        background: "#edf0f5",
        color: "#536078",
      }
    );
  };

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const token = localStorage.getItem("access_token");

        if (!token) {
          navigate("/login");
          return;
        }

        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const profileResponse = await api.get(
          "my-profile/",
          config
        );

        if (!isMounted) return;

        const currentProfile = profileResponse.data;
        setProfile(currentProfile);

        const profilesResponse = await api.get(
          "profiles/",
          config
        );

        if (!isMounted) return;

        const profilesData = Array.isArray(profilesResponse.data)
          ? profilesResponse.data
          : profilesResponse.data.results || [];

        setAlumni(
          profilesData.filter(
            (item) => item.role === "alumni"
          )
        );

        const mentorshipResponse = await api.get(
          "mentorships/",
          config
        );

        if (!isMounted) return;

        const requestData = Array.isArray(mentorshipResponse.data)
          ? mentorshipResponse.data
          : mentorshipResponse.data.results || [];

        setRequests(requestData);
      } catch (error) {
        console.error("Mentorship loading error:", error);

        if (!isMounted) return;

        if (error.response?.status === 401) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          navigate("/login");
        } else {
          setError("Unable to load mentorship data.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const handleSendRequest = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!isStudent) {
      setError("Only students can request mentorship.");
      return;
    }

    if (!selectedAlumni) {
      setError("Please select an alumni.");
      return;
    }

    if (!profile) {
      setError("Profile not loaded.");
      return;
    }

    setSending(true);

    try {
      const token = localStorage.getItem("access_token");

      const response = await api.post(
        "mentorships/",
        {
          student: profile.id,
          alumni: Number(selectedAlumni),
          message: message.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setRequests((previousRequests) => [
        ...previousRequests,
        response.data,
      ]);

      setSelectedAlumni("");
      setMessage("");
      setSuccess("Mentorship request sent successfully.");
    } catch (error) {
      console.error("Mentorship request error:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        navigate("/login");
      } else if (error.response) {
        setError(
          "Unable to send request: " +
            JSON.stringify(error.response.data)
        );
      } else {
        setError("Unable to connect to the backend.");
      }
    } finally {
      setSending(false);
    }
  };

  const updateRequestStatus = async (requestId, status) => {
    if (!isAlumni) {
      setError("Only alumni can update mentorship requests.");
      return;
    }

    setError("");
    setSuccess("");
    setUpdatingId(requestId);

    try {
      const token = localStorage.getItem("access_token");

      const response = await api.patch(
        `mentorships/${requestId}/`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setRequests((previousRequests) =>
        previousRequests.map((item) =>
          item.id === requestId ? response.data : item
        )
      );

      setSuccess(`Request ${status} successfully.`);
    } catch (error) {
      console.error("Update request error:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        navigate("/login");
      } else {
        setError(
          error.response?.data?.detail ||
            "Unable to update mentorship request."
        );
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const visibleRequests = requests.filter((item) => {
    if (isAdmin) return true;

    const studentId = getId(item.student);
    const alumniId = getId(item.alumni);

    if (isStudent) {
      return studentId === profile?.id;
    }

    if (isAlumni) {
      return alumniId === profile?.id;
    }

    return false;
  });

  const styles = {
    page: {
      minHeight: "100vh",
      background: "#f4f7fb",
      padding: "35px 20px 60px",
      color: "#172b4d",
      fontFamily: "Inter, Arial, sans-serif",
    },
    container: {
      maxWidth: "1180px",
      margin: "0 auto",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "18px",
      marginBottom: "28px",
    },
    eyebrow: {
      color: "#5268df",
      fontSize: "12px",
      fontWeight: "800",
      letterSpacing: "2px",
      textTransform: "uppercase",
      marginBottom: "8px",
    },
    heading: {
      fontSize: "clamp(27px, 4vw, 38px)",
      fontWeight: "800",
      letterSpacing: "-1px",
      margin: "0 0 8px",
      color: "#172b4d",
    },
    subtitle: {
      color: "#758198",
      margin: 0,
      fontSize: "14px",
      lineHeight: 1.7,
    },
    backButton: {
      border: "1px solid #dce3ef",
      background: "#fff",
      color: "#344563",
      borderRadius: "12px",
      padding: "12px 17px",
      fontWeight: "700",
      cursor: "pointer",
    },
    hero: {
      background:
        "linear-gradient(120deg, #253b80 0%, #5268df 60%, #7888ed 100%)",
      color: "#fff",
      borderRadius: "22px",
      padding: "30px",
      marginBottom: "25px",
      boxShadow: "0 12px 30px rgba(57, 78, 174, 0.16)",
    },
    heroTitle: {
      fontSize: "25px",
      fontWeight: "800",
      margin: "0 0 10px",
    },
    heroText: {
      fontSize: "14px",
      lineHeight: 1.8,
      color: "#e7ebff",
      maxWidth: "680px",
      margin: 0,
    },
    stats: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(145px, 1fr))",
      gap: "15px",
      marginBottom: "25px",
    },
    statCard: {
      background: "#fff",
      border: "1px solid #e9edf5",
      borderRadius: "16px",
      padding: "20px",
      boxShadow: "0 5px 20px rgba(25, 42, 80, 0.035)",
    },
    panel: {
      background: "#fff",
      border: "1px solid #e9edf5",
      borderRadius: "20px",
      padding: "25px",
      boxShadow: "0 5px 22px rgba(25, 42, 80, 0.045)",
      minWidth: 0,
    },
    panelTitle: {
      fontSize: "20px",
      fontWeight: "800",
      margin: "0 0 7px",
      color: "#172b4d",
    },
    panelSubtitle: {
      color: "#8490a5",
      fontSize: "13px",
      margin: "0 0 23px",
      lineHeight: 1.6,
    },
    label: {
      display: "block",
      fontSize: "13px",
      fontWeight: "700",
      color: "#394867",
      marginBottom: "8px",
    },
    input: {
      width: "100%",
      boxSizing: "border-box",
      border: "1px solid #dfe5ef",
      borderRadius: "11px",
      padding: "12px 13px",
      fontSize: "14px",
      color: "#253858",
      background: "#fbfcff",
      outline: "none",
      fontFamily: "inherit",
    },
    field: {
      marginBottom: "18px",
    },
    primaryButton: {
      border: "none",
      borderRadius: "11px",
      background: "linear-gradient(100deg, #4358d7, #6679ec)",
      color: "#fff",
      padding: "13px 17px",
      fontWeight: "800",
      fontSize: "14px",
      cursor: "pointer",
    },
    requestCard: {
      border: "1px solid #e8edf5",
      borderRadius: "16px",
      padding: "21px",
      marginBottom: "15px",
      background: "#fff",
      overflowWrap: "anywhere",
    },
    actionButton: {
      border: "none",
      borderRadius: "10px",
      padding: "10px 16px",
      fontWeight: "800",
      fontSize: "13px",
      cursor: "pointer",
    },
    alert: {
      padding: "14px 17px",
      borderRadius: "12px",
      marginBottom: "20px",
      fontSize: "14px",
      lineHeight: 1.6,
      overflowWrap: "anywhere",
    },
    empty: {
      textAlign: "center",
      padding: "40px 15px",
      background: "#f8faff",
      border: "1px dashed #dce3f0",
      borderRadius: "15px",
    },
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div
          style={{
            ...styles.container,
            textAlign: "center",
            paddingTop: "100px",
          }}
        >
          <div style={{ fontSize: "36px" }}>🤝</div>
          <h3 style={{ color: "#253b80" }}>
            Loading mentorship...
          </h3>
          <p style={styles.subtitle}>
            Connecting students with experienced alumni.
          </p>
        </div>
      </div>
    );
  }

  const pendingCount = visibleRequests.filter(
    (item) => item.status === "pending"
  ).length;

  const acceptedCount = visibleRequests.filter(
    (item) => item.status === "accepted"
  ).length;

  return (
    <div style={styles.page}>
      <style>{`
        .mentor-input:focus {
          border-color: #6879e7 !important;
          box-shadow: 0 0 0 3px rgba(104,121,231,0.12);
          background: #fff !important;
        }
        .mentor-card:hover {
          box-shadow: 0 9px 25px rgba(25,42,80,0.06);
        }
        .mentor-button:hover {
          filter: brightness(1.05);
        }
        @media (max-width: 520px) {
          .mentor-page {
            padding: 24px 13px 40px !important;
          }
          .mentor-panel {
            padding: 19px !important;
          }
          .mentor-hero {
            padding: 23px !important;
          }
        }
      `}</style>

      <div className="mentor-page" style={styles.container}>
        <div style={styles.header}>
          <div>
            <div style={styles.eyebrow}>
              AlumniLoop • Career Growth
            </div>
            <h1 style={styles.heading}>Mentorship</h1>
            <p style={styles.subtitle}>
              Learn from experience. Grow with your alumni community.
            </p>
          </div>

          <button
            type="button"
            style={styles.backButton}
            onClick={() => navigate("/dashboard")}
          >
            ← Dashboard
          </button>
        </div>

        <div className="mentor-hero" style={styles.hero}>
          <div style={{ fontSize: "31px", marginBottom: "13px" }}>
            🤝
          </div>
          <h2 style={styles.heroTitle}>
            Your journey, guided by experience.
          </h2>
          <p style={styles.heroText}>
            Connect with alumni, get career guidance, and take confident
            steps toward your professional goals.
          </p>
        </div>

        {success && (
          <div
            style={{
              ...styles.alert,
              background: "#eaf8f0",
              border: "1px solid #ccebd9",
              color: "#19734e",
            }}
          >
            ✓ {success}
          </div>
        )}

        {error && (
          <div
            style={{
              ...styles.alert,
              background: "#fff0f0",
              border: "1px solid #f3d1d1",
              color: "#b8323b",
            }}
          >
            ⚠ {error}
          </div>
        )}

        <div style={styles.stats}>
          <div style={styles.statCard}>
            <div style={{ fontSize: "23px", marginBottom: "9px" }}>
              📋
            </div>
            <div
              style={{
                fontSize: "27px",
                fontWeight: "800",
                color: "#253b80",
              }}
            >
              {visibleRequests.length}
            </div>
            <div style={styles.subtitle}>Total Requests</div>
          </div>

          <div style={styles.statCard}>
            <div style={{ fontSize: "23px", marginBottom: "9px" }}>
              ⏳
            </div>
            <div
              style={{
                fontSize: "27px",
                fontWeight: "800",
                color: "#b17a0b",
              }}
            >
              {pendingCount}
            </div>
            <div style={styles.subtitle}>Pending</div>
          </div>

          <div style={styles.statCard}>
            <div style={{ fontSize: "23px", marginBottom: "9px" }}>
              ✅
            </div>
            <div
              style={{
                fontSize: "27px",
                fontWeight: "800",
                color: "#16805b",
              }}
            >
              {acceptedCount}
            </div>
            <div style={styles.subtitle}>Accepted</div>
          </div>
        </div>

        {isStudent && (
          <section
            className="mentor-panel"
            style={{ ...styles.panel, marginBottom: "25px" }}
          >
            <div style={{ fontSize: "27px", marginBottom: "10px" }}>
              🎓
            </div>
            <h2 style={styles.panelTitle}>
              Request a Mentor
            </h2>
            <p style={styles.panelSubtitle}>
              Choose an alumnus and explain what guidance you need.
            </p>

            {alumni.length === 0 ? (
              <div style={styles.empty}>
                <p style={{ margin: 0, color: "#64718a" }}>
                  No alumni profiles are available yet.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendRequest}>
                <div style={styles.field}>
                  <label style={styles.label}>
                    Select Alumni *
                  </label>
                  <select
                    className="mentor-input"
                    style={styles.input}
                    value={selectedAlumni}
                    onChange={(e) =>
                      setSelectedAlumni(e.target.value)
                    }
                    required
                  >
                    <option value="">Choose a mentor</option>
                    {alumni.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.full_name || `Alumni #${item.id}`}
                        {" — "}
                        {item.company || "Company not provided"}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>
                    Your Message
                  </label>
                  <textarea
                    className="mentor-input"
                    style={{
                      ...styles.input,
                      minHeight: "120px",
                      resize: "vertical",
                    }}
                    rows="4"
                    placeholder="Example: I need guidance on preparing for software interviews..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>

                <button
                  className="mentor-button"
                  type="submit"
                  style={{
                    ...styles.primaryButton,
                    opacity: sending ? 0.7 : 1,
                  }}
                  disabled={sending}
                >
                  {sending ? "Sending..." : "Send Mentorship Request →"}
                </button>
              </form>
            )}
          </section>
        )}

        <section className="mentor-panel" style={styles.panel}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
              marginBottom: "7px",
            }}
          >
            <h2 style={styles.panelTitle}>
              {isStudent
                ? "My Mentorship Requests"
                : isAlumni
                ? "Requests from Students"
                : "All Mentorship Requests"}
            </h2>

            <span
              style={{
                ...getStatusStyle("pending"),
                padding: "7px 11px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: "800",
              }}
            >
              {pendingCount} pending
            </span>
          </div>

          <p style={styles.panelSubtitle}>
            Track request status and mentorship progress.
          </p>

          {visibleRequests.length === 0 ? (
            <div style={styles.empty}>
              <div style={{ fontSize: "38px", marginBottom: "12px" }}>
                💬
              </div>
              <h3 style={{ margin: "0 0 8px", color: "#344563" }}>
                No mentorship requests yet
              </h3>
              <p style={styles.subtitle}>
                {isStudent
                  ? "Send a request to an alumnus to begin."
                  : isAlumni
                  ? "Student requests will appear here."
                  : "Mentorship activity will appear here."}
              </p>
            </div>
          ) : (
            visibleRequests.map((item) => {
              const studentId = getId(item.student);
              const alumniId = getId(item.alumni);
              const statusStyle = getStatusStyle(item.status);

              return (
                <article
                  key={item.id}
                  className="mentor-card"
                  style={styles.requestCard}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      flexWrap: "wrap",
                      gap: "12px",
                      marginBottom: "17px",
                    }}
                  >
                    <div>
                      <div style={styles.eyebrow}>
                        Request #{item.id}
                      </div>
                      <h3
                        style={{
                          margin: "0 0 5px",
                          color: "#243b73",
                          fontSize: "17px",
                          fontWeight: "800",
                        }}
                      >
                        {isStudent
                          ? getName(item.alumni)
                          : getName(item.student)}
                      </h3>
                      <p style={{ ...styles.subtitle, fontSize: "12px" }}>
                        {isStudent
                          ? "Your selected mentor"
                          : "Student seeking guidance"}
                      </p>
                    </div>

                    <span
                      style={{
                        ...statusStyle,
                        borderRadius: "8px",
                        padding: "8px 12px",
                        fontSize: "12px",
                        fontWeight: "800",
                        textTransform: "capitalize",
                      }}
                    >
                      {item.status || "pending"}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(160px, 1fr))",
                      gap: "12px",
                      marginBottom: "16px",
                    }}
                  >
                    <div
                      style={{
                        background: "#f8faff",
                        borderRadius: "10px",
                        padding: "12px",
                      }}
                    >
                      <div
                        style={{
                          ...styles.subtitle,
                          fontSize: "12px",
                          marginBottom: "5px",
                        }}
                      >
                        Student
                      </div>
                      <strong>{getName(item.student)}</strong>
                    </div>

                    <div
                      style={{
                        background: "#f8faff",
                        borderRadius: "10px",
                        padding: "12px",
                      }}
                    >
                      <div
                        style={{
                          ...styles.subtitle,
                          fontSize: "12px",
                          marginBottom: "5px",
                        }}
                      >
                        Alumni Mentor
                      </div>
                      <strong>{getName(item.alumni)}</strong>
                    </div>
                  </div>

                  <div
                    style={{
                      background: "#f8faff",
                      borderRadius: "11px",
                      padding: "14px",
                      marginBottom: "16px",
                    }}
                  >
                    <div
                      style={{
                        ...styles.label,
                        marginBottom: "6px",
                      }}
                    >
                      Message
                    </div>
                    <p
                      style={{
                        margin: 0,
                        color: "#64718a",
                        fontSize: "14px",
                        lineHeight: 1.8,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {item.message || "No message provided."}
                    </p>
                  </div>

                  {isAlumni && item.status === "pending" && (
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                      <button
                        type="button"
                        className="mentor-button"
                        style={{
                          ...styles.actionButton,
                          background: "#eaf8f0",
                          color: "#16805b",
                          opacity: updatingId === item.id ? 0.6 : 1,
                        }}
                        disabled={updatingId === item.id}
                        onClick={() =>
                          updateRequestStatus(item.id, "accepted")
                        }
                      >
                        {updatingId === item.id
                          ? "Updating..."
                          : "✓ Accept"}
                      </button>

                      <button
                        type="button"
                        className="mentor-button"
                        style={{
                          ...styles.actionButton,
                          background: "#fff0f0",
                          color: "#c23b45",
                          opacity: updatingId === item.id ? 0.6 : 1,
                        }}
                        disabled={updatingId === item.id}
                        onClick={() =>
                          updateRequestStatus(item.id, "rejected")
                        }
                      >
                        ✕ Reject
                      </button>
                    </div>
                  )}

                  {isAdmin && (
                    <p
                      style={{
                        margin: 0,
                        color: "#8994a8",
                        fontSize: "12px",
                      }}
                    >
                      Admin view · Read only
                    </p>
                  )}

                  <div style={{ display: "none" }}>
                    {studentId} {alumniId}
                  </div>
                </article>
              );
            })
          )}
        </section>

        <div
          style={{
            textAlign: "center",
            marginTop: "30px",
            color: "#8994a8",
            fontSize: "12px",
          }}
        >
          AlumniLoop · Learn, connect and grow together
        </div>
      </div>
    </div>
  );
}

export default Mentorship;