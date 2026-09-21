import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";


function Dashboard() {

  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);

  const [loading, setLoading] = useState(true);


  useEffect(() => {

    let isMounted = true;


    const loadProfile = async () => {

      try {

        const token =
          localStorage.getItem(
            "access_token"
          );


        if (!token) {

          navigate("/login");

          return;
        }


        const response = await api.get(
          "my-profile/",
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );


        if (!isMounted) {
          return;
        }


        setProfile(response.data);

      } catch (error) {

        console.error(
          "Dashboard profile error:",
          error
        );


        if (!isMounted) {
          return;
        }


        if (
          error.response?.status === 401
        ) {

          localStorage.removeItem(
            "access_token"
          );

          localStorage.removeItem(
            "refresh_token"
          );

          navigate("/login");
        }

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


  const handleLogout = () => {

    localStorage.removeItem(
      "access_token"
    );

    localStorage.removeItem(
      "refresh_token"
    );

    navigate("/login");

  };


  if (loading) {

    return (
      <div className="container mt-5">

        <div className="text-center">

          <h4>
            Loading Dashboard...
          </h4>

        </div>

      </div>
    );

  }


  return (

    <div className="container mt-5 mb-5">

      <div className="card shadow p-4">

        <h2 className="text-center mb-2">
          Alumni Networking Platform
        </h2>

        <h4 className="text-center mb-4">
          Dashboard
        </h4>


        {profile && (

          <div className="text-center mb-4">

            <h5>
              Welcome, {profile.full_name}
            </h5>

            <span className="badge bg-primary">
              {profile.role}
            </span>

          </div>

        )}


        <div className="row g-3">


          <div className="col-md-4">

            <button
              className="btn btn-outline-primary w-100"
              onClick={() =>
                navigate("/profile")
              }
            >
              Profile
            </button>

          </div>


          <div className="col-md-4">

            <button
              className="btn btn-outline-primary w-100"
              onClick={() =>
                navigate("/search-alumni")
              }
            >
              Search Alumni
            </button>

          </div>


          <div className="col-md-4">

            <button
              className="btn btn-outline-primary w-100"
              onClick={() =>
                navigate("/posts")
              }
            >
              Posts
            </button>

          </div>


          <div className="col-md-4">

            <button
              className="btn btn-outline-primary w-100"
              onClick={() =>
                navigate("/jobs")
              }
            >
              Jobs / Opportunities
            </button>

          </div>


          <div className="col-md-4">

            <button
              className="btn btn-outline-primary w-100"
              onClick={() =>
                navigate("/mentorship")
              }
            >
              Mentorship
            </button>

          </div>


          <div className="col-md-4">

            <button
              className="btn btn-outline-primary w-100"
              onClick={() =>
                navigate("/messages")
              }
            >
              Messages
            </button>

          </div>


          {profile?.role === "admin" && (

            <div className="col-md-4">

              <button
                className="btn btn-outline-danger w-100"
                onClick={() =>
                  navigate("/admin-dashboard")
                }
              >
                Admin Dashboard
              </button>

            </div>

          )}


        </div>


        <button
          className="btn btn-danger mt-4"
          onClick={handleLogout}
        >
          Logout
        </button>


      </div>

    </div>

  );

}


export default Dashboard;