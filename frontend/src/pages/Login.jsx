import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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

      // Save JWT tokens
      localStorage.setItem("access_token", response.data.access);
      localStorage.setItem("refresh_token", response.data.refresh);

      // Go to dashboard
      navigate("/dashboard");

    } catch (error) {
      console.error("Login error:", error);

      if (error.response) {
        if (error.response.status === 401) {
          setError("Invalid email or password.");
        } else {
          setError(
            "Login failed: " +
              JSON.stringify(error.response.data)
          );
        }
      } else {
        setError("Unable to connect to the backend.");
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-5">

          <div className="card shadow p-4">

            <h2 className="text-center mb-4">
              Alumni Networking Platform
            </h2>

            <h4 className="text-center mb-4">
              Login
            </h4>

            {/* Error Message */}
            {error && (
              <div className="alert alert-danger">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin}>

              {/* Email */}
              <div className="mb-3">
                <div className="row align-items-center">

                  <label className="col-4 text-end">
                    Email :
                  </label>

                  <div className="col-8">
                    <input
                      type="email"
                      className="form-control"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                </div>
              </div>

              {/* Password */}
              <div className="mb-3">
                <div className="row align-items-center">

                  <label className="col-4 text-end">
                    Password :
                  </label>

                  <div className="col-8">
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                className="btn btn-primary w-100"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </button>

            </form>

            {/* Signup */}
            <p className="text-center mt-3 mb-0">
              Don't have an account?{" "}
              <a href="/signup">Sign up</a>
            </p>

          </div>

        </div>
      </div>
    </div>
  );
}

export default Login;