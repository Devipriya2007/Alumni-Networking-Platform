import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Auth.css";
import "./Signup.css";

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

const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

if (formData.role !== "admin" &&
    (!formData.admission_year || !formData.graduation_year)) {
  setError("Please enter your admission and graduation years.");
  return;
}

if (
  formData.role === "alumni" &&
  (!formData.company.trim() || !formData.job_role.trim())
) {
  setError("Please enter your company name and job role.");
  return;
}

if (
  formData.role !== "admin" &&
  Number(formData.graduation_year) < Number(formData.admission_year)
) {
  setError("Graduation year cannot be earlier than admission year.");
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

  setTimeout(() => navigate("/login"), 1500);
} catch (err) {
  const status = err.response?.status;
  const responseData = err.response?.data;

  console.error("Signup status:", status);
  console.error("Signup response:", responseData || err.message);

  if (!err.response) {
    setError("Cannot connect to the backend. Check whether Django is running.");
  } else if (typeof responseData === "string") {
    setError(`Server error (${status}). Check backend logs.`);
  } else if (responseData && typeof responseData === "object") {
    const messages = Object.entries(responseData).map(([field, value]) => {
      const detail = Array.isArray(value)
        ? value.join(", ")
        : typeof value === "object"
          ? JSON.stringify(value)
          : String(value);

      return `${field}: ${detail}`;
    });

    setError(messages.join(" | ") || `Request failed with status ${status}.`);
  } else {
    setError(`Request failed with status ${status}.`);
  }
} finally {
  setLoading(false);
}


};

const renderInput = (label, name, placeholder, type = "text", options = {}) => ( <div className="signup-field" key={name}> <label htmlFor={name}>{label}</label>
<input
id={name}
type={type}
name={name}
value={formData[name]}
onChange={handleChange}
placeholder={placeholder}
required={options.required !== false}
min={options.min}
max={options.max}
autoComplete={options.autoComplete}
/> </div>
);

const renderPassword = (label, name, placeholder, visible, toggle) => ( <div className="signup-field" key={name}> <label htmlFor={name}>{label}</label> <div className="signup-password-wrap">
<input
id={name}
type={visible ? "text" : "password"}
name={name}
value={formData[name]}
onChange={handleChange}
placeholder={placeholder}
autoComplete={name === "password" ? "new-password" : "new-password"}
required
/> <button type="button" onClick={toggle}>
{visible ? "Hide" : "Show"} </button> </div> </div>
);

return ( <div className="auth-page signup-page"> <section className="auth-welcome signup-welcome"> <Link to="/login" className="auth-brand"> <span className="auth-brand-icon">🎓</span> <span>
Alumni Networking <br />
Platform </span> </Link>


    <div className="auth-tagline">
      <span>CONNECT</span>
      <span>•</span>
      <span>LEARN</span>
      <span>•</span>
      <span>GROW</span>
    </div>

    <div className="auth-welcome-copy">
      <span className="auth-small-label">YOUR NEXT CHAPTER STARTS HERE</span>
      <h1>
        One Community,
        <br />
        <span>Countless Opportunities.</span>
      </h1>
      <p>
        Create your account to connect with alumni, discover career
        opportunities, and grow together.
      </p>
    </div>

    <div className="auth-benefits">
      <div>
        <span className="benefit-icon">🤝</span>
        <strong>Connect</strong>
        <small>Build relationships</small>
      </div>
      <div>
        <span className="benefit-icon">📚</span>
        <strong>Learn</strong>
        <small>Gain guidance</small>
      </div>
      <div>
        <span className="benefit-icon">🚀</span>
        <strong>Grow</strong>
        <small>Find opportunities</small>
      </div>
    </div>
  </section>

  <section className="auth-form-side signup-form-side">
    <div className="signup-form-card">
      <div className="auth-mobile-brand">🎓 Alumni Network</div>

      <div className="signup-heading">
        <span className="section-kicker">JOIN OUR COMMUNITY</span>
        <h2>Create Your Account</h2>
        <p>Fill in your details to get started.</p>
      </div>

      {error && <div className="auth-error" role="alert">{error}</div>}
      {success && <div className="signup-success" role="status">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="signup-section-title">
          <span>01</span>
          Personal details
        </div>

        <div className="signup-fields-grid">
          {renderInput("Full name", "full_name", "Enter your full name", "text", {
            autoComplete: "name",
          })}
          {renderInput("Email address", "email", "Enter your email", "email", {
            autoComplete: "email",
          })}
        </div>

        <div className="signup-fields-grid">
          {renderPassword(
            "Password",
            "password",
            "Create a strong password",
            showPassword,
            () => setShowPassword(!showPassword)
          )}
          {renderPassword(
            "Confirm password",
            "confirm_password",
            "Enter password again",
            showConfirmPassword,
            () => setShowConfirmPassword(!showConfirmPassword)
          )}
        </div>

        <p className="signup-password-hint">
          Use 8+ characters with uppercase, lowercase, a number and a special character.
        </p>

        <div className="signup-section-title">
          <span>02</span>
          Account type
        </div>

        <div className="signup-field">
          <label htmlFor="role">Register as</label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleRoleChange}
          >
            <option value="student">Student</option>
            <option value="alumni">Alumni</option>
            <option value="admin">Admin</option>
          </select>
          <small className="signup-role-note">
            Choose the account type that applies to you.
          </small>
        </div>

        {formData.role !== "admin" && (
          <>
            <div className="signup-section-title">
              <span>03</span>
              Academic details
            </div>

            <div className="signup-fields-grid">
              <div className="signup-field">
                <label htmlFor="department">Department</label>
                <select
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select department</option>
                  <option value="CSE">Computer Science and Engineering</option>
                  <option value="IT">Information Technology</option>
                  <option value="AIDS">Artificial Intelligence and Data Science</option>
                  <option value="Cyber Security">Cyber Security</option>
                  <option value="EEE">Electrical and Electronics Engineering</option>
                  <option value="ECE">Electronics and Communication Engineering</option>
                  <option value="Mechanical">Mechanical Engineering</option>
                  <option value="Aeronautical">Aeronautical Engineering</option>
                </select>
              </div>

              {renderInput("Admission year", "admission_year", "Example: 2023", "number", {
                min: 2000,
                max: 2100,
              })}
              {renderInput("Graduation year", "graduation_year", "Example: 2027", "number", {
                min: 2000,
                max: 2100,
              })}
            </div>
          </>
        )}

        {formData.role === "alumni" && (
          <>
            <div className="signup-section-title">
              <span>04</span>
              Professional details
            </div>

            <div className="signup-fields-grid">
              {renderInput("Company", "company", "Example: TCS")}
              {renderInput("Job role", "job_role", "Example: Software Engineer")}
            </div>

            <div className="signup-field">
              <label htmlFor="skills">Skills</label>
              <textarea
                id="skills"
                name="skills"
                rows="2"
                value={formData.skills}
                onChange={handleChange}
                placeholder="Java, Python, SQL, React..."
              />
            </div>

            <div className="signup-field">
              <label htmlFor="bio">About you</label>
              <textarea
                id="bio"
                name="bio"
                rows="3"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Share a little about your career and experience..."
              />
            </div>
          </>
        )}

        <button
          type="submit"
          className="auth-submit signup-submit"
          disabled={loading}
        >
          {loading ? "Creating account..." : "Create Account"}
          {!loading && <span aria-hidden="true">→</span>}
        </button>
      </form>

      <p className="auth-switch signup-login-link">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>

      <p className="auth-security">
        🔐 Your account details are handled securely.
      </p>
    </div>
  </section>
</div>

);
}

export default Signup;
