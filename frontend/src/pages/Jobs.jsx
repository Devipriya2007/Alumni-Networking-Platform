
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Jobs() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [applicationStats, setApplicationStats] = useState(null);
  const [applyingJobId, setApplyingJobId] = useState(null);

  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [applicationLink, setApplicationLink] = useState("");

  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const isStudent = profile?.role === "student";
  const isAlumni = profile?.role === "alumni";
  const isAdmin = profile?.role === "admin";

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

        const profileResponse = await api.get("my-profile/", config);

        if (!isMounted) return;

        const currentProfile = profileResponse.data;
        setProfile(currentProfile);

        const jobsResponse = await api.get("jobs/", config);

        if (!isMounted) return;

        const jobsData = Array.isArray(jobsResponse.data)
          ? jobsResponse.data
          : jobsResponse.data.results || [];

        setJobs(jobsData);

        // Only admin can view application statistics.
        if (currentProfile.role === "admin") {
          try {
            const statsResponse = await api.get(
              "jobs/application-stats/",
              config
            );

            if (isMounted) {
              setApplicationStats(statsResponse.data);
            }
          } catch (statsError) {
            console.error("Application statistics error:", statsError);

            if (isMounted) {
              setError("Unable to load application statistics.");
            }
          }
        }
      } catch (error) {
        console.error("Jobs loading error:", error);

        if (!isMounted) return;

        if (error.response?.status === 401) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          navigate("/login");
        } else {
          setError("Unable to load jobs.");
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

  const handleCreateJob = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!title.trim()) {
      setError("Please enter job title.");
      return;
    }

    if (!company.trim()) {
      setError("Please enter company name.");
      return;
    }

    if (!description.trim()) {
      setError("Please enter job description.");
      return;
    }

    if (!profile) {
      setError("Profile not loaded.");
      return;
    }

    if (!isAlumni) {
      setError("Only alumni can create job opportunities.");
      return;
    }

    setPosting(true);

    try {
      const token = localStorage.getItem("access_token");

      const response = await api.post(
        "jobs/",
        {
          posted_by: profile.id,
          title: title.trim(),
          company: company.trim(),
          description: description.trim(),
          location: location.trim(),
          application_link: applicationLink.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setJobs((previousJobs) => [
        response.data,
        ...previousJobs,
      ]);

      setTitle("");
      setCompany("");
      setDescription("");
      setLocation("");
      setApplicationLink("");

      setMessage("Job opportunity posted successfully.");
      setError("");
    } catch (error) {
      console.error("Create job error:", error);

      if (error.response) {
        setError(
          "Unable to create job: " +
            JSON.stringify(error.response.data)
        );
      } else {
        setError("Unable to connect to the backend.");
      }
    } finally {
      setPosting(false);
    }
  };

  const handleApplyJob = async (jobId) => {
    if (!isStudent) {
      setError("Only students can apply for jobs.");
      return;
    }

    setError("");
    setMessage("");
    setApplyingJobId(jobId);

    try {
      const token = localStorage.getItem("access_token");

      const response = await api.post(
        `jobs/${jobId}/apply/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(
        response.data.message || "Application submitted successfully."
      );

      // Refresh application counts if statistics are available.
      if (applicationStats) {
        const statsResponse = await api.get(
          "jobs/application-stats/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setApplicationStats(statsResponse.data);
      }
    } catch (error) {
      console.error("Apply job error:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        navigate("/login");
      } else {
        setError(
          error.response?.data?.message ||
            error.response?.data?.detail ||
            "Unable to submit your application."
        );
      }
    } finally {
      setApplyingJobId(null);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!isAlumni) {
      setError("Only alumni can delete job opportunities.");
      return;
    }

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this job?"
    );

    if (!confirmDelete) return;

    setError("");
    setMessage("");

    try {
      const token = localStorage.getItem("access_token");

      await api.delete(`jobs/${jobId}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setJobs((previousJobs) =>
        previousJobs.filter((job) => job.id !== jobId)
      );

      setMessage("Job deleted successfully.");
    } catch (error) {
      console.error("Delete job error:", error);
      setError(
        error.response?.data?.detail ||
          "Unable to delete job."
      );
    }
  };

  const getApplicationCount = (jobId) => {
    if (!applicationStats?.jobs) return 0;

    const jobStats = applicationStats.jobs.find(
      (item) => item.id === jobId
    );

    return jobStats?.application_count ?? 0;
  };

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
      fontSize: "15px",
      lineHeight: 1.6,
    },
    backButton: {
      border: "1px solid #dce3ef",
      background: "#ffffff",
      color: "#344563",
      borderRadius: "12px",
      padding: "12px 17px",
      fontWeight: "700",
      cursor: "pointer",
    },
    hero: {
      background:
        "linear-gradient(120deg, #253b80 0%, #5268df 60%, #7888ed 100%)",
      color: "#ffffff",
      borderRadius: "22px",
      padding: "30px",
      marginBottom: "28px",
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
      maxWidth: "650px",
      margin: 0,
    },
    grid: {
      display: "grid",
      gridTemplateColumns: isAlumni
        ? "minmax(0, 1.05fr) minmax(0, 1.35fr)"
        : "minmax(0, 1fr)",
      gap: "25px",
      alignItems: "start",
    },
    panel: {
      background: "#ffffff",
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
      marginBottom: "17px",
    },
    primaryButton: {
      width: "100%",
      border: "none",
      borderRadius: "11px",
      background: "linear-gradient(100deg, #4358d7, #6679ec)",
      color: "#ffffff",
      padding: "14px",
      fontWeight: "800",
      fontSize: "14px",
      cursor: "pointer",
      boxShadow: "0 5px 13px rgba(75, 96, 219, 0.18)",
    },
    jobCard: {
      border: "1px solid #e8edf5",
      borderRadius: "16px",
      padding: "21px",
      marginBottom: "16px",
      background: "#ffffff",
      transition: "box-shadow 0.2s ease",
      overflowWrap: "anywhere",
    },
    jobTitle: {
      fontSize: "19px",
      fontWeight: "800",
      color: "#243b73",
      margin: "0 0 7px",
      lineHeight: 1.4,
    },
    company: {
      color: "#5365d9",
      fontSize: "14px",
      fontWeight: "700",
      margin: "0 0 15px",
    },
    tagRow: {
      display: "flex",
      flexWrap: "wrap",
      gap: "8px",
      marginBottom: "17px",
    },
    tag: {
      display: "inline-block",
      background: "#f0f3ff",
      color: "#4b5fc7",
      borderRadius: "8px",
      padding: "7px 10px",
      fontSize: "12px",
      fontWeight: "700",
    },
    description: {
      color: "#64718a",
      fontSize: "14px",
      lineHeight: 1.8,
      whiteSpace: "pre-wrap",
      margin: "0 0 19px",
    },
    cardActions: {
      display: "flex",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "10px",
      borderTop: "1px solid #edf0f6",
      paddingTop: "16px",
    },
    applyButton: {
      display: "inline-block",
      border: "none",
      textDecoration: "none",
      background: "#eaf8f1",
      color: "#16805b",
      borderRadius: "10px",
      padding: "11px 16px",
      fontWeight: "800",
      fontSize: "13px",
      cursor: "pointer",
    },
    externalButton: {
      display: "inline-block",
      textDecoration: "none",
      background: "#edf2ff",
      color: "#4358bd",
      borderRadius: "10px",
      padding: "11px 16px",
      fontWeight: "800",
      fontSize: "13px",
    },
    deleteButton: {
      border: "1px solid #f3d5d8",
      background: "#fff5f5",
      color: "#cf414b",
      borderRadius: "10px",
      padding: "10px 14px",
      fontWeight: "700",
      cursor: "pointer",
      fontSize: "13px",
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
      padding: "42px 15px",
      background: "#f8faff",
      border: "1px dashed #dce3f0",
      borderRadius: "15px",
    },
    statCard: {
      background: "#f0f3ff",
      border: "1px solid #e0e6ff",
      borderRadius: "14px",
      padding: "18px",
      marginBottom: "22px",
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
          <div style={{ fontSize: "35px", marginBottom: "12px" }}>
            💼
          </div>
          <h3 style={{ color: "#253b80" }}>
            Loading opportunities...
          </h3>
          <p style={styles.subtitle}>
            Finding jobs for your next step.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <style>{`
        .jobs-form-input:focus {
          border-color: #6879e7 !important;
          box-shadow: 0 0 0 3px rgba(104,121,231,0.12);
          background: #ffffff !important;
        }
        .jobs-card:hover {
          box-shadow: 0 9px 25px rgba(25,42,80,0.07);
        }
        .jobs-primary:hover {
          filter: brightness(1.05);
        }
        .jobs-apply:hover {
          background: #d8f3e6 !important;
        }
        @media (max-width: 850px) {
          .jobs-layout {
            grid-template-columns: minmax(0, 1fr) !important;
          }
        }
        @media (max-width: 520px) {
          .jobs-page {
            padding: 24px 13px 40px !important;
          }
          .jobs-panel {
            padding: 19px !important;
          }
          .jobs-hero {
            padding: 23px !important;
          }
        }
      `}</style>

      <div className="jobs-page" style={styles.container}>
        <div style={styles.header}>
          <div>
            <div style={styles.eyebrow}>
              AlumniLoop • Career Hub
            </div>
            <h1 style={styles.heading}>
              Jobs & Opportunities
            </h1>
            <p style={styles.subtitle}>
              Discover opportunities and take the next step in your career.
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

        <div className="jobs-hero" style={styles.hero}>
          <div style={{ fontSize: "30px", marginBottom: "13px" }}>
            🚀
          </div>
          <h2 style={styles.heroTitle}>
            Your next opportunity starts here.
          </h2>
          <p style={styles.heroText}>
            Explore career openings shared by your alumni community.
            Connect your skills with new opportunities and move forward
            with confidence.
          </p>

          <div
            style={{
              display: "inline-block",
              marginTop: "19px",
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.23)",
              padding: "9px 13px",
              borderRadius: "9px",
              fontSize: "13px",
              fontWeight: "700",
            }}
          >
            💼 {jobs.length}{" "}
            {jobs.length === 1 ? "Opportunity" : "Opportunities"} available
          </div>
        </div>

        {message && (
          <div
            style={{
              ...styles.alert,
              background: "#eaf8f0",
              border: "1px solid #ccebd9",
              color: "#19734e",
            }}
          >
            ✓ {message}
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

        {isAdmin && (
          <section style={styles.panel}>
            <h2 style={styles.panelTitle}>
              Application Overview
            </h2>
            <p style={styles.panelSubtitle}>
              Monitor student applications across job opportunities.
            </p>

            <div style={styles.statCard}>
              <p
                style={{
                  margin: "0 0 8px",
                  color: "#5268df",
                  fontSize: "13px",
                  fontWeight: "700",
                }}
              >
                Total Student Applications
              </p>
              <div
                style={{
                  fontSize: "32px",
                  fontWeight: "800",
                  color: "#253b80",
                }}
              >
                {applicationStats?.total_applications ?? "—"}
              </div>
            </div>
          </section>
        )}

        <div
          className="jobs-layout"
          style={{
            ...styles.grid,
            marginTop: isAdmin ? "25px" : "0",
          }}
        >
          {isAlumni && (
            <section className="jobs-panel" style={styles.panel}>
              <div style={{ fontSize: "25px", marginBottom: "12px" }}>
                ✍️
              </div>
              <h2 style={styles.panelTitle}>
                Share an Opportunity
              </h2>
              <p style={styles.panelSubtitle}>
                Help students and fellow alumni discover new career paths.
              </p>

              <form onSubmit={handleCreateJob}>
                <div style={styles.field}>
                  <label style={styles.label}>Job Title *</label>
                  <input
                    className="jobs-form-input"
                    style={styles.input}
                    type="text"
                    placeholder="e.g. Software Developer Intern"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Company Name *</label>
                  <input
                    className="jobs-form-input"
                    style={styles.input}
                    type="text"
                    placeholder="Enter company name"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>
                    Job Description *
                  </label>
                  <textarea
                    className="jobs-form-input"
                    style={{
                      ...styles.input,
                      minHeight: "125px",
                      resize: "vertical",
                    }}
                    rows="4"
                    placeholder="Describe the role, skills and responsibilities..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Location</label>
                  <input
                    className="jobs-form-input"
                    style={styles.input}
                    type="text"
                    placeholder="e.g. Chennai / Remote"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Application URL</label>
                  <input
                    className="jobs-form-input"
                    style={styles.input}
                    type="url"
                    placeholder="https://example.com/apply"
                    value={applicationLink}
                    onChange={(e) => setApplicationLink(e.target.value)}
                  />
                </div>

                <button
                  className="jobs-primary"
                  type="submit"
                  style={{
                    ...styles.primaryButton,
                    opacity: posting ? 0.7 : 1,
                    cursor: posting ? "wait" : "pointer",
                  }}
                  disabled={posting}
                >
                  {posting ? "Publishing..." : "+ Publish Opportunity"}
                </button>
              </form>
            </section>
          )}

          <section className="jobs-panel" style={styles.panel}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "12px",
                flexWrap: "wrap",
                marginBottom: "7px",
              }}
            >
              <h2 style={styles.panelTitle}>
                Latest Opportunities
              </h2>
              <span style={styles.tag}>{jobs.length} total</span>
            </div>

            <p style={styles.panelSubtitle}>
              Opportunities from your alumni network.
            </p>

            {jobs.length === 0 ? (
              <div style={styles.empty}>
                <div style={{ fontSize: "38px", marginBottom: "12px" }}>
                  🔎
                </div>
                <h3
                  style={{
                    margin: "0 0 8px",
                    color: "#344563",
                  }}
                >
                  No opportunities yet
                </h3>
                <p
                  style={{
                    ...styles.subtitle,
                    fontSize: "14px",
                  }}
                >
                  New job openings will appear here when they are posted.
                </p>
              </div>
            ) : (
              jobs.map((job) => (
                <article
                  key={job.id}
                  className="jobs-card"
                  style={styles.jobCard}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: "13px",
                      alignItems: "flex-start",
                      marginBottom: "12px",
                    }}
                  >
                    <div
                      style={{
                        width: "46px",
                        height: "46px",
                        minWidth: "46px",
                        borderRadius: "13px",
                        background: "#edf0ff",
                        color: "#4b5fd0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "22px",
                      }}
                    >
                      💼
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <h3 style={styles.jobTitle}>{job.title}</h3>
                      <p style={styles.company}>{job.company}</p>
                    </div>
                  </div>

                  <div style={styles.tagRow}>
                    <span style={styles.tag}>
                      📍 {job.location || "Location not specified"}
                    </span>
                    <span
                      style={{
                        ...styles.tag,
                        background: "#eaf8f1",
                        color: "#16805b",
                      }}
                    >
                      Open Opportunity
                    </span>
                  </div>

                  <p style={styles.description}>
                    {job.description}
                  </p>

                  {isAdmin && (
                    <div
                      style={{
                        ...styles.statCard,
                        marginBottom: "16px",
                      }}
                    >
                      <span
                        style={{
                          color: "#5268df",
                          fontSize: "13px",
                          fontWeight: "700",
                        }}
                      >
                        Student applications
                      </span>
                      <div
                        style={{
                          fontSize: "24px",
                          fontWeight: "800",
                          color: "#253b80",
                          marginTop: "5px",
                        }}
                      >
                        {getApplicationCount(job.id)}
                      </div>
                    </div>
                  )}

                  <div style={styles.cardActions}>
                    {isStudent && (
                      <button
                        className="jobs-apply"
                        type="button"
                        style={{
                          ...styles.applyButton,
                          opacity:
                            applyingJobId === job.id ? 0.7 : 1,
                          cursor:
                            applyingJobId === job.id
                              ? "wait"
                              : "pointer",
                        }}
                        disabled={applyingJobId === job.id}
                        onClick={() => handleApplyJob(job.id)}
                      >
                        {applyingJobId === job.id
                          ? "Applying..."
                          : "Apply Through AlumniLoop"}
                      </button>
                    )}

                    {isStudent && job.application_link && (
                      <a
                        className="jobs-apply"
                        style={styles.externalButton}
                        href={job.application_link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Company Website ↗
                      </a>
                    )}

                    {isAlumni && (
                      <>
                        {job.application_link && (
                          <a
                            style={styles.externalButton}
                            href={job.application_link}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View Application Link ↗
                          </a>
                        )}

                        <button
                          type="button"
                          style={styles.deleteButton}
                          onClick={() => handleDeleteJob(job.id)}
                        >
                          🗑 Delete
                        </button>
                      </>
                    )}

                    {isAdmin && (
                      <span
                        style={{
                          fontSize: "12px",
                          color: "#8994a8",
                        }}
                      >
                        Admin view · Read only
                      </span>
                    )}

                    {!job.application_link && isStudent && (
                      <span
                        style={{
                          fontSize: "12px",
                          color: "#8994a8",
                        }}
                      >
                        No external application link provided
                      </span>
                    )}
                  </div>
                </article>
              ))
            )}
          </section>
        </div>

        <div
          style={{
            textAlign: "center",
            marginTop: "30px",
            color: "#8994a8",
            fontSize: "12px",
          }}
        >
          AlumniLoop · Connecting people with opportunities
        </div>
      </div>
    </div>
  );
}

export default Jobs;