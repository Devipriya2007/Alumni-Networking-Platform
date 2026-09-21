import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Jobs() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);

  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [applicationLink, setApplicationLink] = useState("");

  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Load profile and jobs
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

        // Get logged-in profile
        const profileResponse = await api.get(
          "my-profile/",
          config
        );

        if (!isMounted) {
          return;
        }

        setProfile(profileResponse.data);

        // Get jobs
        const jobsResponse = await api.get(
          "jobs/"
        );

        if (!isMounted) {
          return;
        }

        setJobs(jobsResponse.data);

      } catch (error) {
        console.error(
          "Jobs loading error:",
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
            "Unable to load jobs."
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

  // Create job
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

    if (profile.role !== "alumni") {
      setError(
        "Only alumni can create job opportunities."
      );
      return;
    }

    setPosting(true);

    try {
      const token = localStorage.getItem(
        "access_token"
      );

      const response = await api.post(
        "jobs/",
        {
          posted_by: profile.id,
          title: title,
          company: company,
          description: description,
          location: location,
          application_link: applicationLink,
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

      setMessage(
        "Job opportunity posted successfully."
      );

    } catch (error) {
      console.error(
        "Create job error:",
        error
      );

      if (error.response) {
        setError(
          "Unable to create job: " +
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
      setPosting(false);
    }
  };

  // Delete job
  const handleDeleteJob = async (jobId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this job?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const token = localStorage.getItem(
        "access_token"
      );

      await api.delete(
        `jobs/${jobId}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setJobs((previousJobs) =>
        previousJobs.filter(
          (job) => job.id !== jobId
        )
      );

      setMessage(
        "Job deleted successfully."
      );

      setError("");

    } catch (error) {
      console.error(
        "Delete job error:",
        error
      );

      setError(
        "Unable to delete job."
      );
    }
  };

  // Loading
  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <h4>
            Loading jobs...
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
          Jobs / Opportunities
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
      {message && (
        <div className="alert alert-success">
          {message}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {/* Alumni Create Job */}
      {profile?.role === "alumni" && (
        <div className="card shadow-sm mb-4">

          <div className="card-body">

            <h5 className="mb-3">
              Post Job / Opportunity
            </h5>

            <form onSubmit={handleCreateJob}>

              {/* Title */}
              <div className="mb-3">

                <label className="form-label">
                  Job Title
                </label>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Example: Software Developer Intern"
                  value={title}
                  onChange={(e) =>
                    setTitle(e.target.value)
                  }
                />

              </div>

              {/* Company */}
              <div className="mb-3">

                <label className="form-label">
                  Company
                </label>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter company name"
                  value={company}
                  onChange={(e) =>
                    setCompany(e.target.value)
                  }
                />

              </div>

              {/* Description */}
              <div className="mb-3">

                <label className="form-label">
                  Description
                </label>

                <textarea
                  className="form-control"
                  rows="4"
                  placeholder="Enter job description"
                  value={description}
                  onChange={(e) =>
                    setDescription(
                      e.target.value
                    )
                  }
                />

              </div>

              {/* Location */}
              <div className="mb-3">

                <label className="form-label">
                  Location
                </label>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Example: Chennai / Remote"
                  value={location}
                  onChange={(e) =>
                    setLocation(
                      e.target.value
                    )
                  }
                />

              </div>

              {/* Application Link */}
              <div className="mb-3">

                <label className="form-label">
                  Application Link
                </label>

                <input
                  type="url"
                  className="form-control"
                  placeholder="https://example.com/apply"
                  value={applicationLink}
                  onChange={(e) =>
                    setApplicationLink(
                      e.target.value
                    )
                  }
                />

              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={posting}
              >
                {posting
                  ? "Posting..."
                  : "Post Opportunity"}
              </button>

            </form>

          </div>

        </div>
      )}

      {/* Job List */}
      <div className="card shadow-sm">

        <div className="card-body">

          <h5 className="mb-3">
            Available Opportunities
          </h5>

          {jobs.length === 0 ? (

            <div className="alert alert-info">
              No job opportunities available.
            </div>

          ) : (

            jobs.map((job) => (

              <div
                key={job.id}
                className="border rounded p-3 mb-3"
              >

                <h5>
                  {job.title}
                </h5>

                <p className="mb-1">
                  <strong>
                    Company:
                  </strong>{" "}
                  {job.company}
                </p>

                <p className="mb-1">
                  <strong>
                    Location:
                  </strong>{" "}
                  {job.location ||
                    "Not specified"}
                </p>

                <p className="mb-2">
                  <strong>
                    Description:
                  </strong>{" "}
                  {job.description}
                </p>

                {job.application_link && (
                  <p className="mb-2">

                    <strong>
                      Apply:
                    </strong>{" "}

                    <a
                      href={
                        job.application_link
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Application Link
                    </a>

                  </p>
                )}

                {/* Delete only for alumni */}
                {profile?.role === "alumni" && (
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() =>
                      handleDeleteJob(
                        job.id
                      )
                    }
                  >
                    Delete
                  </button>
                )}

              </div>

            ))

          )}

        </div>

      </div>

    </div>
  );
}

export default Jobs;