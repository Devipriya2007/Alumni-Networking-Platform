import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import "./SearchAlumni.css";

function SearchAlumni() {
const [alumni, setAlumni] = useState([]);
const [search, setSearch] = useState("");
const [department, setDepartment] = useState("all");
const [graduationYear, setGraduationYear] = useState("all");
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");


useEffect(() => {
    let isMounted = true;

    const loadAlumni = async () => {
        try {
            const response = await api.get("profiles/");
            const alumniUsers = response.data.filter(
                (user) => user.role?.toLowerCase() === "alumni"
            );

            if (isMounted) {
                setAlumni(alumniUsers);
                setError("");
            }
        } catch {
            if (isMounted) {
                setError("Unable to load alumni. Please try again.");
            }
        } finally {
            if (isMounted) {
                setLoading(false);
            }
        }
    };

    loadAlumni();

    return () => {
        isMounted = false;
    };
}, []);

const departments = useMemo(
    () => [...new Set(
        alumni.map((user) => user.department).filter(Boolean)
    )].sort(),
    [alumni]
);

const graduationYears = useMemo(
    () => [...new Set(
        alumni.map((user) => user.graduation_year).filter(Boolean)
    )].sort((a, b) => Number(b) - Number(a)),
    [alumni]
);

const filteredAlumni = useMemo(() => {
    const searchText = search.toLowerCase().trim();

    return alumni.filter((user) => {
        const skillsText = Array.isArray(user.skills)
            ? user.skills.join(" ")
            : user.skills || "";

        const searchableText = [
            user.full_name,
            user.department,
            user.company,
            user.job_role,
            skillsText,
            user.bio,
            user.graduation_year
        ].filter(Boolean).join(" ").toLowerCase();

        const matchesSearch = searchableText.includes(searchText);
        const matchesDepartment =
            department === "all" || user.department === department;
        const matchesYear =
            graduationYear === "all" ||
            String(user.graduation_year) === graduationYear;

        return matchesSearch && matchesDepartment && matchesYear;
    });
}, [alumni, search, department, graduationYear]);

const getInitials = (name) => {
    if (!name) return "AL";

    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();
};

const clearFilters = () => {
    setSearch("");
    setDepartment("all");
    setGraduationYear("all");
};

return (
    <main className="search-alumni-page">
        <section className="alumni-search-hero">
            <div className="alumni-hero-content">
                <span className="alumni-eyebrow">
                    YOUR ALUMNI COMMUNITY
                </span>

                <h1>Find Your People.</h1>

                <p>
                    Discover alumni, explore career journeys, and find
                    people who can help you grow.
                </p>

                <div className="alumni-search-box">
                    <span className="search-icon" aria-hidden="true">
                        &#128269;
                    </span>

                    <input
                        type="search"
                        aria-label="Search alumni"
                        placeholder="Search name, skills, company or job role..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    {search && (
                        <button
                            type="button"
                            className="clear-search"
                            onClick={() => setSearch("")}
                            aria-label="Clear search"
                        >
                            &#10005;
                        </button>
                    )}
                </div>

                <div className="alumni-hero-note">
                    <span aria-hidden="true">&#10003;</span>
                    Build connections. Learn from experience.
                </div>
            </div>

            <div className="alumni-hero-decoration" aria-hidden="true">
                <div className="decoration-circle circle-one"></div>
                <div className="decoration-circle circle-two"></div>
                <div className="decoration-card">
                    <span className="decoration-emoji">&#127891;</span>
                    <span>One community</span>
                    <strong>Endless possibilities</strong>
                </div>
            </div>
        </section>

        <section className="alumni-directory">
            <div className="directory-heading">
                <div>
                    <span className="section-kicker">CONNECT & GROW</span>
                    <h2>Explore Alumni</h2>
                    <p>Find experienced professionals from your community.</p>
                </div>

                <div className="alumni-count">
                    <strong>{loading ? "—" : filteredAlumni.length}</strong>
                    <span>
                        {filteredAlumni.length === 1 ? "Alumnus" : "Alumni"} found
                    </span>
                </div>
            </div>

            <div className="alumni-filters">
                <label className="filter-field">
                    <span>Department</span>
                    <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                    >
                        <option value="all">All departments</option>
                        {departments.map((item) => (
                            <option key={item} value={item}>
                                {item}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="filter-field">
                    <span>Graduation year</span>
                    <select
                        value={graduationYear}
                        onChange={(e) => setGraduationYear(e.target.value)}
                    >
                        <option value="all">All years</option>
                        {graduationYears.map((year) => (
                            <option key={year} value={String(year)}>
                                {year}
                            </option>
                        ))}
                    </select>
                </label>

                <button
                    type="button"
                    className="reset-filters"
                    onClick={clearFilters}
                >
                    Reset filters
                </button>
            </div>

            {loading && (
                <div className="alumni-state">
                    <div className="loading-spinner"></div>
                    <h3>Finding your alumni community...</h3>
                    <p>Please wait a moment.</p>
                </div>
            )}

            {!loading && error && (
                <div className="alumni-state error-state" role="alert">
                    <span className="state-icon">&#9888;</span>
                    <h3>Something went wrong</h3>
                    <p>{error}</p>
                    <button
                        type="button"
                        className="retry-button"
                        onClick={() => window.location.reload()}
                    >
                        Try again
                    </button>
                </div>
            )}

            {!loading && !error && filteredAlumni.length === 0 && (
                <div className="alumni-state">
                    <span className="state-icon">&#128269;</span>
                    <h3>No alumni found</h3>
                    <p>
                        Try another keyword or remove some filters.
                    </p>
                    <button
                        type="button"
                        className="retry-button"
                        onClick={clearFilters}
                    >
                        Clear filters
                    </button>
                </div>
            )}

            {!loading && !error && filteredAlumni.length > 0 && (
                <div className="alumni-profile-grid">
                    {filteredAlumni.map((user, index) => {
                        const skills = Array.isArray(user.skills)
                            ? user.skills
                            : (user.skills || "")
                                .split(",")
                                .map((skill) => skill.trim())
                                .filter(Boolean);

                        return (
                            <article
                                className="alumni-profile-card"
                                key={user.id}
                            >
                                <div
                                    className={`profile-card-top profile-color-${index % 4}`}
                                >
                                    <span className="profile-label">
                                        ALUMNI
                                    </span>
                                    <div className="profile-avatar">
                                        {getInitials(user.full_name)}
                                    </div>
                                </div>

                                <div className="profile-card-content">
                                    <h3>
                                        {user.full_name || "Alumni Member"}
                                    </h3>

                                    <p className="profile-job">
                                        {user.job_role || "Professional"}
                                    </p>

                                    {user.company && (
                                        <div className="profile-detail">
                                            <span aria-hidden="true">
                                                &#127970;
                                            </span>
                                            <span>{user.company}</span>
                                        </div>
                                    )}

                                    {user.department && (
                                        <div className="profile-detail">
                                            <span aria-hidden="true">
                                                &#127891;
                                            </span>
                                            <span>{user.department}</span>
                                        </div>
                                    )}

                                    {user.graduation_year && (
                                        <div className="profile-detail">
                                            <span aria-hidden="true">
                                                &#128197;
                                            </span>
                                            <span>
                                                Class of {user.graduation_year}
                                            </span>
                                        </div>
                                    )}

                                    {user.bio && (
                                        <p className="profile-bio">
                                            {user.bio}
                                        </p>
                                    )}

                                    {skills.length > 0 && (
                                        <div className="profile-skills">
                                            <span className="skills-heading">
                                                SKILLS
                                            </span>
                                            <div className="skill-badges">
                                                {skills.slice(0, 4).map(
                                                    (skill, skillIndex) => (
                                                        <span
                                                            className="skill-badge"
                                                            key={`${user.id}-${skillIndex}`}
                                                        >
                                                            {skill}
                                                        </span>
                                                    )
                                                )}
                                                {skills.length > 4 && (
                                                    <span className="skill-badge more-skills">
                                                        +{skills.length - 4}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </section>
    </main>
);


}

export default SearchAlumni;
