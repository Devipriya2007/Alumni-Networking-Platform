import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Auth.css";

function Login() {
const navigate = useNavigate();

const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [showPassword, setShowPassword] = useState(false);
const [error, setError] = useState("");
const [loading, setLoading] = useState(false);

const handleLogin = async (e) => {
e.preventDefault();
setError("");
setLoading(true);


try {
  const response = await api.post("login/", {
    username: email,
    password: password,
  });

  localStorage.setItem("access_token", response.data.access);
  localStorage.setItem("refresh_token", response.data.refresh);

  navigate("/dashboard");
} catch (error) {
  console.error("Login error:", error);

  if (error.response?.status === 401) {
    setError("Invalid email or password.");
  } else if (error.response) {
    setError("Login failed. Please check your details and try again.");
  } else {
    setError("Unable to connect to the backend.");
  }
} finally {
  setLoading(false);
}


};

return ( <div className="auth-page"> <section className="auth-welcome"> <Link to="/login" className="auth-brand"> <span className="auth-brand-icon">🎓</span> <span>
Alumni Networking <br />
Platform </span> </Link>

```
    <div className="auth-tagline">
      <span>CONNECT</span>
      <span>•</span>
      <span>LEARN</span>
      <span>•</span>
      <span>GROW</span>
    </div>

    <div className="auth-welcome-copy">
      <span className="auth-small-label">YOUR COMMUNITY, YOUR FUTURE</span>
      <h1>
        Reconnecting Talents,
        <br />
        <span>Building Futures.</span>
      </h1>
      <p>
        Join your alumni community. Discover opportunities,
        share experiences, and build connections that last.
      </p>
    </div>

    <div className="auth-benefits">
      <div>
        <span className="benefit-icon">🤝</span>
        <strong>Connect</strong>
        <small>Meet your community</small>
      </div>
      <div>
        <span className="benefit-icon">📚</span>
        <strong>Learn</strong>
        <small>Share experiences</small>
      </div>
      <div>
        <span className="benefit-icon">🚀</span>
        <strong>Grow</strong>
        <small>Explore opportunities</small>
      </div>
    </div>
  </section>

  <section className="auth-form-side">
    <div className="auth-form-card">
      <div className="auth-mobile-brand">🎓 Alumni Network</div>

      <div className="auth-form-heading">
        <div className="auth-form-icon">✦</div>
        <h2>Welcome Back!</h2>
        <p>Sign in to continue your journey with us.</p>
      </div>

      {error && (
        <div className="auth-error" role="alert">
          <span>!</span>
          {error}
        </div>
      )}

      <form onSubmit={handleLogin}>
        <div className="auth-field">
          <label htmlFor="login-email">Email address</label>
          <div className="auth-input-wrap">
            <span aria-hidden="true">✉</span>
            <input
              id="login-email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>
        </div>

        <div className="auth-field">
          <label htmlFor="login-password">Password</label>
          <div className="auth-input-wrap">
            <span aria-hidden="true">🔒</span>
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              className="auth-password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="auth-submit"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign In"}
          {!loading && <span aria-hidden="true">→</span>}
        </button>
      </form>

      <div className="auth-divider">
        <span></span>
        <small>YOUR ALUMNI JOURNEY STARTS HERE</small>
        <span></span>
      </div>

      <p className="auth-switch">
        Don't have an account? <Link to="/signup">Create account</Link>
      </p>

      <p className="auth-security">
        🔐 Your account details are handled securely.
      </p>
    </div>
  </section>
</div>

);
}

export default Login;
