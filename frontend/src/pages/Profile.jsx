
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Profile.css";

function ProfileField({ label, value, icon }) {
    const displayValue =
        value === null || value === undefined || value === ""
            ? "Not added yet"
            : value;

    return (
        <div className="profile-info-item">
            <div className="profile-info-icon">{icon}</div>
            <div className="profile-info-content">
                <span className="profile-field-label">{label}</span>
                <p>{displayValue}</p>
            </div>
        </div>
    );
}

function ProfileInputField({
    label,
    name,
    type = "text",
    placeholder = "",
    required = false,
    formData,
    handleChange,
}) {
    return (
        <div className="profile-form-group">
            <label htmlFor={name}>{label}</label>
            <input
                id={name}
                type={type}
                name={name}
                value={formData[name] ?? ""}
                onChange={handleChange}
                placeholder={placeholder}
                required={required}
            />
        </div>
    );
}

function Profile() {
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [formData, setFormData] = useState({});
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

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
                    setFormData(response.data);
                }
            } catch (err) {
                if (!isMounted) return;

                if (err.response?.status === 401) {
                    localStorage.removeItem("access_token");
                    localStorage.removeItem("refresh_token");
                    navigate("/login");
                    return;
                }

                setError("Unable to load profile. Please try again.");
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

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleEdit = () => {
        setError("");
        setSuccess("");
        setEditing(true);
    };

    const handleCancel = () => {
        setFormData(profile);
        setError("");
        setSuccess("");
        setEditing(false);
    };

    const handleSave = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");
        setSaving(true);

        try {
            const token = localStorage.getItem("access_token");

            if (!token) {
                navigate("/login");
                return;
            }

            const data = {
                full_name: formData.full_name,
                department: formData.department || "",
                admission_year: formData.admission_year
                    ? Number(formData.admission_year)
                    : null,
                graduation_year: formData.graduation_year
                    ? Number(formData.graduation_year)
                    : null,
                company: formData.company || "",
                job_role: formData.job_role || "",
                skills: formData.skills || "",
                bio: formData.bio || "",
            };

            const response = await api.put("my-profile/", data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setProfile(response.data);
            setFormData(response.data);
            setEditing(false);
            setSuccess("Profile updated successfully.");
        } catch (err) {
            if (err.response?.status === 401) {
                localStorage.removeItem("access_token");
                localStorage.removeItem("refresh_token");
                navigate("/login");
                return;
            }

            setError(
                err.response?.data?.detail ||
                "Unable to update profile. Please try again."
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="profile-page">
                <div className="profile-status">
                    <div className="profile-spinner"></div>
                    <p>Loading your profile...</p>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="profile-page">
                <div className="profile-alert profile-alert-error">
                    {error || "Profile not found."}
                    <button
                        type="button"
                        onClick={() => navigate("/dashboard")}
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const initials = (profile.full_name || "User")
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((word) => word.charAt(0).toUpperCase())
        .join("");

    const isAdmin = profile.role === "admin";
    const isAlumni = profile.role === "alumni";

    return (
        <main className="profile-page">
            <div className="profile-container">
                <header className="profile-topbar">
                    <div>
                        <span className="profile-eyebrow">
                            ALUMNI NETWORKING PLATFORM
                        </span>
                        <h1>My Profile</h1>
                        <p>
                            Manage your personal and professional information.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="profile-back-button"
                        onClick={() => navigate("/dashboard")}
                    >
                        ← Dashboard
                    </button>
                </header>

                {error && (
                    <div
                        className="profile-alert profile-alert-error"
                        role="alert"
                    >
                        {error}
                    </div>
                )}

                {success && (
                    <div
                        className="profile-alert profile-alert-success"
                        role="status"
                    >
                        ✓ {success}
                    </div>
                )}

                <section className="profile-hero">
                    <div className="profile-avatar">
                        {initials || "U"}
                    </div>

                    <div className="profile-hero-details">
                        <span className="profile-hero-label">
                            YOUR ACCOUNT
                        </span>
                        <h2>{profile.full_name || "Your Name"}</h2>
                        <p>{profile.email || "No email available"}</p>

                        <span className="profile-role-badge">
                            {profile.role || "User"}
                        </span>
                    </div>

                    {!editing && (
                        <button
                            type="button"
                            className="profile-primary-button"
                            onClick={handleEdit}
                        >
                            ✎ Edit Profile
                        </button>
                    )}
                </section>

                {!editing ? (
                    <div className="profile-content-grid">
                        <section className="profile-card">
                            <div className="profile-card-heading">
                                <div>
                                    <span className="profile-section-number">
                                        01
                                    </span>
                                    <h3>Personal Information</h3>
                                </div>
                                <span className="profile-heading-icon">
                                    ♙
                                </span>
                            </div>

                            <div className="profile-info-list">
                                <ProfileField
                                    label="Full Name"
                                    value={profile.full_name}
                                    icon="✦"
                                />
                                <ProfileField
                                    label="Email Address"
                                    value={profile.email}
                                    icon="✉"
                                />
                                <ProfileField
                                    label="Account Role"
                                    value={profile.role}
                                    icon="◎"
                                />
                            </div>
                        </section>

                        {!isAdmin && (
                            <section className="profile-card">
                                <div className="profile-card-heading">
                                    <div>
                                        <span className="profile-section-number">
                                            02
                                        </span>
                                        <h3>Education</h3>
                                    </div>
                                    <span className="profile-heading-icon">
                                        ▤
                                    </span>
                                </div>

                                <div className="profile-info-list">
                                    <ProfileField
                                        label="Department"
                                        value={profile.department}
                                        icon="⌂"
                                    />
                                    <ProfileField
                                        label="Admission Year"
                                        value={profile.admission_year}
                                        icon="↗"
                                    />
                                    <ProfileField
                                        label="Graduation Year"
                                        value={profile.graduation_year}
                                        icon="✓"
                                    />
                                    <ProfileField
                                        label="Graduation Status"
                                        value={profile.graduation_status}
                                        icon="◇"
                                    />
                                </div>
                            </section>
                        )}

                        {isAlumni && (
                            <>
                                <section className="profile-card">
                                    <div className="profile-card-heading">
                                        <div>
                                            <span className="profile-section-number">
                                                03
                                            </span>
                                            <h3>Professional Details</h3>
                                        </div>
                                        <span className="profile-heading-icon">
                                            ▣
                                        </span>
                                    </div>

                                    <div className="profile-info-list">
                                        <ProfileField
                                            label="Company"
                                            value={profile.company}
                                            icon="▦"
                                        />
                                        <ProfileField
                                            label="Job Role / Designation"
                                            value={profile.job_role}
                                            icon="✧"
                                        />
                                    </div>
                                </section>

                                <section className="profile-card">
                                    <div className="profile-card-heading">
                                        <div>
                                            <span className="profile-section-number">
                                                04
                                            </span>
                                            <h3>Skills & About Me</h3>
                                        </div>
                                        <span className="profile-heading-icon">
                                            ✳
                                        </span>
                                    </div>

                                    <div className="profile-info-list">
                                        <div className="profile-info-item">
                                            <div className="profile-info-icon">
                                                ✧
                                            </div>
                                            <div className="profile-info-content">
                                                <span className="profile-field-label">
                                                    Skills
                                                </span>

                                                {profile.skills ? (
                                                    <div className="profile-skill-tags">
                                                        {profile.skills
                                                            .split(",")
                                                            .map((skill) =>
                                                                skill.trim()
                                                            )
                                                            .filter(Boolean)
                                                            .map((skill, index) => (
                                                                <span
                                                                    className="profile-skill-tag"
                                                                    key={`${skill}-${index}`}
                                                                >
                                                                    {skill}
                                                                </span>
                                                            ))}
                                                    </div>
                                                ) : (
                                                    <p>Not added yet</p>
                                                )}
                                            </div>
                                        </div>

                                        <ProfileField
                                            label="Bio"
                                            value={profile.bio}
                                            icon="☰"
                                        />
                                    </div>
                                </section>
                            </>
                        )}

                        <div className="profile-footer-note">
                            <span>🔒</span>
                            <p>
                                Keep your information updated so your college
                                community can connect with you.
                            </p>
                        </div>
                    </div>
                ) : (
                    <form
                        className="profile-card profile-edit-card"
                        onSubmit={handleSave}
                    >
                        <div className="profile-card-heading">
                            <div>
                                <span className="profile-section-number">
                                    EDIT
                                </span>
                                <h3>Update Your Information</h3>
                                <p className="profile-edit-description">
                                    Make your changes below and save your profile.
                                </p>
                            </div>
                        </div>

                        <div className="profile-form-grid">
                            <ProfileInputField
                                label="Full Name"
                                name="full_name"
                                placeholder="Enter your full name"
                                required
                                formData={formData}
                                handleChange={handleChange}
                            />

                            <ProfileInputField
                                label="Email Address"
                                name="email"
                                type="email"
                                formData={formData}
                                handleChange={handleChange}
                            />

                            <div className="profile-form-group">
                                <label htmlFor="profile-role">
                                    Account Role
                                </label>
                                <input
                                    id="profile-role"
                                    type="text"
                                    value={formData.role || ""}
                                    readOnly
                                />
                            </div>

                            {!isAdmin && (
                                <>
                                    <ProfileInputField
                                        label="Department"
                                        name="department"
                                        placeholder="e.g. Information Technology"
                                        formData={formData}
                                        handleChange={handleChange}
                                    />

                                    <ProfileInputField
                                        label="Admission Year"
                                        name="admission_year"
                                        type="number"
                                        placeholder="e.g. 2023"
                                        formData={formData}
                                        handleChange={handleChange}
                                    />

                                    <ProfileInputField
                                        label="Graduation Year"
                                        name="graduation_year"
                                        type="number"
                                        placeholder="e.g. 2027"
                                        formData={formData}
                                        handleChange={handleChange}
                                    />

                                    <div className="profile-form-group">
                                        <label htmlFor="profile-status">
                                            Graduation Status
                                        </label>
                                        <input
                                            id="profile-status"
                                            type="text"
                                            value={
                                                formData.graduation_status || ""
                                            }
                                            readOnly
                                        />
                                        <small>
                                            This field is managed by the system.
                                        </small>
                                    </div>
                                </>
                            )}

                            {isAlumni && (
                                <>
                                    <ProfileInputField
                                        label="Company"
                                        name="company"
                                        placeholder="Your current company"
                                        formData={formData}
                                        handleChange={handleChange}
                                    />

                                    <ProfileInputField
                                        label="Job Role / Designation"
                                        name="job_role"
                                        placeholder="e.g. Software Engineer"
                                        formData={formData}
                                        handleChange={handleChange}
                                    />

                                    <div className="profile-form-group profile-form-full">
                                        <label htmlFor="profile-skills">
                                            Skills
                                        </label>
                                        <textarea
                                            id="profile-skills"
                                            name="skills"
                                            rows={3}
                                            value={formData.skills || ""}
                                            onChange={handleChange}
                                            placeholder="Java, Python, SQL"
                                        />
                                        <small>
                                            Separate skills with commas.
                                        </small>
                                    </div>

                                    <div className="profile-form-group profile-form-full">
                                        <label htmlFor="profile-bio">
                                            Bio
                                        </label>
                                        <textarea
                                            id="profile-bio"
                                            name="bio"
                                            rows={4}
                                            value={formData.bio || ""}
                                            onChange={handleChange}
                                            placeholder="Tell your college community about yourself..."
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="profile-form-actions">
                            <button
                                type="submit"
                                className="profile-primary-button"
                                disabled={saving}
                            >
                                {saving ? "Saving..." : "✓ Save Changes"}
                            </button>

                            <button
                                type="button"
                                className="profile-cancel-button"
                                onClick={handleCancel}
                                disabled={saving}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </main>
    );
}

export default Profile;