
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Signup() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        password: "",
        confirm_password: "",
        role: "student",
        department: "",
        admission_year: "",
        graduation_year: "",
        company: "",
        job_role: "",
        skills: "",
        bio: "",
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleRoleChange = (e) => {
        const role = e.target.value;

        setFormData((previous) => ({
            ...previous,
            role,
            department: role === "admin" ? "" : previous.department,
            admission_year: role === "admin" ? "" : previous.admission_year,
            graduation_year: role === "admin" ? "" : previous.graduation_year,
            company: role === "alumni" ? previous.company : "",
            job_role: role === "alumni" ? previous.job_role : "",
            skills: role === "alumni" ? previous.skills : "",
            bio: role === "alumni" ? previous.bio : "",
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (formData.password !== formData.confirm_password) {
            setError("Passwords do not match.");
            return;
        }

        const passwordPattern =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

        if (!passwordPattern.test(formData.password)) {
            setError(
                "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character."
            );
            return;
        }

        if (formData.role !== "admin" && !formData.department) {
            setError("Please select your department.");
            return;
        }

        if (formData.role !== "admin" && !formData.admission_year) {
            setError("Please enter your admission year.");
            return;
        }

        if (formData.role !== "admin" && !formData.graduation_year) {
            setError("Please enter your graduation year.");
            return;
        }

        if (
            formData.role === "alumni" &&
            (!formData.company || !formData.job_role)
        ) {
            setError("Please enter your company name and job role.");
            return;
        }

        setLoading(true);

        try {
            const data = {
                full_name: formData.full_name.trim(),
                email: formData.email.trim(),
                password: formData.password,
                role: formData.role,
            };

            if (formData.role !== "admin") {
                data.department = formData.department;
                data.admission_year = Number(formData.admission_year);
                data.graduation_year = Number(formData.graduation_year);
            }

            if (formData.role === "alumni") {
                data.company = formData.company.trim();
                data.job_role = formData.job_role.trim();
                data.skills = formData.skills;
                data.bio = formData.bio;
            }

            const response = await api.post("profiles/", data);

            setSuccess(
                response.data?.message ||
                    "Account created successfully. Please login."
            );

            setFormData({
                full_name: "",
                email: "",
                password: "",
                confirm_password: "",
                role: "student",
                department: "",
                admission_year: "",
                graduation_year: "",
                company: "",
                job_role: "",
                skills: "",
                bio: "",
            });

            setTimeout(() => {
                navigate("/login");
            }, 1500);
        } catch (err) {
            const status = err.response?.status;
            const responseData = err.response?.data;

            console.error("Signup status:", status);
            console.error("Signup response:", responseData || err.message);

            if (!err.response) {
                setError(
                    "Cannot connect to the backend. Check whether Django is running."
                );
            } else if (typeof responseData === "string") {
                setError(`Server error (${status}). Check backend logs.`);
            } else if (responseData && typeof responseData === "object") {
                const messages = Object.entries(responseData).map(
                    ([field, value]) => {
                        const detail = Array.isArray(value)
                            ? value.join(", ")
                            : typeof value === "object"
                            ? JSON.stringify(value)
                            : String(value);

                        return `${field}: ${detail}`;
                    }
                );

                setError(
                    messages.join(" | ") ||
                        `Request failed with status ${status}.`
                );
            } else {
                setError(`Request failed with status ${status}.`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5 mb-5">
            <div className="row justify-content-center">
                <div className="col-md-7 col-lg-6">
                    <div className="card shadow">
                        <div className="card-body p-4">
                            <h2 className="text-center mb-4">
                                Create Account
                            </h2>

                            {error && (
                                <div className="alert alert-danger">
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div className="alert alert-success">
                                    {success}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        name="full_name"
                                        className="form-control"
                                        value={formData.full_name}
                                        onChange={handleChange}
                                        placeholder="Enter your full name"
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        className="form-control"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Enter your email"
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        name="password"
                                        className="form-control"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Enter password"
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">
                                        Confirm Password
                                    </label>
                                    <input
                                        type="password"
                                        name="confirm_password"
                                        className="form-control"
                                        value={formData.confirm_password}
                                        onChange={handleChange}
                                        placeholder="Confirm password"
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">
                                        Register As
                                    </label>
                                    <select
                                        name="role"
                                        className="form-select"
                                        value={formData.role}
                                        onChange={handleRoleChange}
                                    >
                                        <option value="student">Student</option>
                                        <option value="alumni">Alumni</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>

                                {formData.role !== "admin" && (
                                    <>
                                        <div className="mb-3">
                                            <label className="form-label">
                                                Department
                                            </label>
                                            <select
                                                name="department"
                                                className="form-select"
                                                value={formData.department}
                                                onChange={handleChange}
                                                required
                                            >
                                                <option value="">
                                                    Select Department
                                                </option>
                                                <option value="CSE">
                                                    Computer Science and Engineering
                                                </option>
                                                <option value="IT">
                                                    Information Technology
                                                </option>
                                                <option value="AIDS">
                                                    Artificial Intelligence and Data Science
                                                </option>
                                                <option value="Cyber Security">
                                                    Cyber Security
                                                </option>
                                                <option value="EEE">
                                                    Electrical and Electronics Engineering
                                                </option>
                                                <option value="ECE">
                                                    Electronics and Communication Engineering
                                                </option>
                                                <option value="Mechanical">
                                                    Mechanical Engineering
                                                </option>
                                                <option value="Aeronautical">
                                                    Aeronautical Engineering
                                                </option>
                                            </select>
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">
                                                Admission Year
                                            </label>
                                            <input
                                                type="number"
                                                name="admission_year"
                                                className="form-control"
                                                value={formData.admission_year}
                                                onChange={handleChange}
                                                placeholder="Example: 2023"
                                                min="2000"
                                                max="2100"
                                                required
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">
                                                Graduation Year
                                            </label>
                                            <input
                                                type="number"
                                                name="graduation_year"
                                                className="form-control"
                                                value={formData.graduation_year}
                                                onChange={handleChange}
                                                placeholder="Example: 2027"
                                                min="2000"
                                                max="2100"
                                                required
                                            />
                                        </div>
                                    </>
                                )}

                                {formData.role === "alumni" && (
                                    <>
                                        <div className="mb-3">
                                            <label className="form-label">
                                                Company
                                            </label>
                                            <input
                                                type="text"
                                                name="company"
                                                className="form-control"
                                                value={formData.company}
                                                onChange={handleChange}
                                                placeholder="Example: TCS"
                                                required
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">
                                                Job Role / Designation
                                            </label>
                                            <input
                                                type="text"
                                                name="job_role"
                                                className="form-control"
                                                value={formData.job_role}
                                                onChange={handleChange}
                                                placeholder="Example: Software Engineer"
                                                required
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">
                                                Skills
                                            </label>
                                            <textarea
                                                name="skills"
                                                className="form-control"
                                                rows="3"
                                                value={formData.skills}
                                                onChange={handleChange}
                                                placeholder="Example: Java, Python, SQL, React"
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">
                                                Bio
                                            </label>
                                            <textarea
                                                name="bio"
                                                className="form-control"
                                                rows="3"
                                                value={formData.bio}
                                                onChange={handleChange}
                                                placeholder="Tell something about yourself"
                                            />
                                        </div>
                                    </>
                                )}

                                <button
                                    type="submit"
                                    className="btn btn-primary w-100"
                                    disabled={loading}
                                >
                                    {loading
                                        ? "Creating Account..."
                                        : "Create Account"}
                                </button>
                            </form>

                            <div className="text-center mt-3">
                                <span>Already have an account? </span>
                                <button
                                    type="button"
                                    className="btn btn-link p-0"
                                    onClick={() => navigate("/login")}
                                >
                                    Login
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Signup;