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

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load mentorship data
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const token = localStorage.getItem(
          "access_token"
        );

        if (!token) {
          navigate("/login");
          return;
        }

        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        // Get logged-in user's profile
        const profileResponse = await api.get(
          "my-profile/",
          config
        );

        if (!isMounted) {
          return;
        }

        setProfile(profileResponse.data);

        // Get all profiles
        const profilesResponse = await api.get(
          "profiles/"
        );

        if (!isMounted) {
          return;
        }

        const alumniProfiles =
          profilesResponse.data.filter(
            (item) => item.role === "alumni"
          );

        setAlumni(alumniProfiles);

        // Get mentorship requests
        const mentorshipResponse = await api.get(
          "mentorships/",
          config
        );

        if (!isMounted) {
          return;
        }

        setRequests(
          mentorshipResponse.data
        );

      } catch (error) {
        console.error(
          "Mentorship loading error:",
          error
        );

        if (!isMounted) {
          return;
        }

        if (error.response?.status === 401) {
          localStorage.removeItem(
            "access_token"
          );

          localStorage.removeItem(
            "refresh_token"
          );

          navigate("/login");
        } else {
          setError(
            "Unable to load mentorship data."
          );
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

  // Send mentorship request
  const handleSendRequest = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

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
      const token = localStorage.getItem(
        "access_token"
      );

      const response = await api.post(
        "mentorships/",
        {
          student: profile.id,
          alumni: Number(selectedAlumni),
          message: message,
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

      setSuccess(
        "Mentorship request sent successfully."
      );

    } catch (error) {
      console.error(
        "Mentorship request error:",
        error
      );

      if (error.response) {
        setError(
          "Unable to send request: " +
            JSON.stringify(
              error.response.data
            )
        );
      } else {
        setError(
          "Unable to connect to the backend."
        );
      }

    } finally {
      setSending(false);
    }
  };

  // Accept or reject request
  const updateRequestStatus = async (
    requestId,
    status
  ) => {
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem(
        "access_token"
      );

      const response = await api.patch(
        `mentorships/${requestId}/`,
        {
          status: status,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setRequests((previousRequests) =>
        previousRequests.map((item) =>
          item.id === requestId
            ? response.data
            : item
        )
      );

      setSuccess(
        `Request ${status} successfully.`
      );

    } catch (error) {
      console.error(
        "Update request error:",
        error
      );

      setError(
        "Unable to update mentorship request."
      );
    }
  };

  // Loading screen
  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <h4>
            Loading mentorship...
          </h4>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5 mb-5">

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">

        <h2>
          Mentorship
        </h2>

        <button
          className="btn btn-secondary"
          onClick={() =>
            navigate("/dashboard")
          }
        >
          Back to Dashboard
        </button>

      </div>

      {/* Success */}
      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {/* Student - Request Mentorship */}
      {profile?.role === "student" && (
        <div className="card shadow-sm mb-4">

          <div className="card-body">

            <h5 className="mb-3">
              Request Mentorship
            </h5>

            <form
              onSubmit={handleSendRequest}
            >

              {/* Select Alumni */}
              <div className="mb-3">

                <label className="form-label">
                  Select Alumni
                </label>

                <select
                  className="form-select"
                  value={selectedAlumni}
                  onChange={(e) =>
                    setSelectedAlumni(
                      e.target.value
                    )
                  }
                  required
                >

                  <option value="">
                    Select Alumni
                  </option>

                  {alumni.map((item) => (
                    <option
                      key={item.id}
                      value={item.id}
                    >
                      {item.full_name}
                      {" - "}
                      {item.company ||
                        "Company not provided"}
                    </option>
                  ))}

                </select>

              </div>

              {/* Message */}
              <div className="mb-3">

                <label className="form-label">
                  Message
                </label>

                <textarea
                  className="form-control"
                  rows="4"
                  placeholder="Write a short message to the alumni..."
                  value={message}
                  onChange={(e) =>
                    setMessage(
                      e.target.value
                    )
                  }
                />

              </div>

              {/* Send */}
              <button
                type="submit"
                className="btn btn-primary"
                disabled={sending}
              >
                {sending
                  ? "Sending..."
                  : "Send Mentorship Request"}
              </button>

            </form>

          </div>

        </div>
      )}

      {/* Mentorship Requests */}
      <div className="card shadow-sm">

        <div className="card-body">

          <h5 className="mb-3">
            Mentorship Requests
          </h5>

          {requests.length === 0 ? (

            <div className="alert alert-info">
              No mentorship requests yet.
            </div>

          ) : (

            requests.map((item) => {

              const studentId =
                item.student;

              const alumniId =
                item.alumni;

              const isAlumni =
                profile?.id === alumniId;

              const isStudent =
                profile?.id === studentId;

              if (
                !isAlumni &&
                !isStudent
              ) {
                return null;
              }

              return (
                <div
                  className="border rounded p-3 mb-3"
                  key={item.id}
                >

                  <p className="mb-1">
                    <strong>
                      Student ID:
                    </strong>{" "}
                    {studentId}
                  </p>

                  <p className="mb-1">
                    <strong>
                      Alumni ID:
                    </strong>{" "}
                    {alumniId}
                  </p>

                  <p className="mb-1">
                    <strong>
                      Message:
                    </strong>{" "}
                    {item.message ||
                      "No message"}
                  </p>

                  <p className="mb-3">
                    <strong>
                      Status:
                    </strong>{" "}

                    <span
                      className={
                        item.status ===
                        "accepted"
                          ? "text-success"
                          : item.status ===
                            "rejected"
                          ? "text-danger"
                          : "text-warning"
                      }
                    >
                      {item.status}
                    </span>
                  </p>

                  {/* Alumni can accept/reject */}
                  {isAlumni &&
                    item.status ===
                      "pending" && (

                    <div className="d-flex gap-2">

                      <button
                        className="btn btn-success"
                        onClick={() =>
                          updateRequestStatus(
                            item.id,
                            "accepted"
                          )
                        }
                      >
                        Accept
                      </button>

                      <button
                        className="btn btn-danger"
                        onClick={() =>
                          updateRequestStatus(
                            item.id,
                            "rejected"
                          )
                        }
                      >
                        Reject
                      </button>

                    </div>

                  )}

                </div>
              );
            })

          )}

        </div>

      </div>

    </div>
  );
}

export default Mentorship;