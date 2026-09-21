import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";


function AdminDashboard() {

  const navigate = useNavigate();

  const [stats, setStats] = useState(null);

  const [users, setUsers] = useState([]);

  const [search, setSearch] = useState("");

  const [roleFilter, setRoleFilter] = useState("all");

  const [error, setError] = useState("");


  useEffect(() => {

    const token = localStorage.getItem("access_token");

    if (!token) {

      navigate("/login");

      return;
    }


    const loadAdminData = async () => {

      try {

        const [statsResponse, usersResponse] = await Promise.all([

          api.get(
            "admin-dashboard/",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          ),

          api.get(
            "admin-users/",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          ),

        ]);


        setStats(statsResponse.data);

        setUsers(usersResponse.data);

        setError("");

      } catch (err) {

        if (err.response?.status === 401) {

          localStorage.removeItem("access_token");

          localStorage.removeItem("refresh_token");

          navigate("/login");

          return;
        }


        if (err.response?.status === 403) {

          setError(
            "Access denied. Admin access required."
          );

          return;
        }


        setError(
          "Unable to connect to backend."
        );

      }

    };


    loadAdminData();

  }, [navigate]);


  const filteredUsers = users.filter((user) => {

    const searchText = search.toLowerCase();


    const matchesSearch =

      user.full_name
        ?.toLowerCase()
        .includes(searchText)

      ||

      user.email
        ?.toLowerCase()
        .includes(searchText)

      ||

      user.department
        ?.toLowerCase()
        .includes(searchText)

      ||

      user.company
        ?.toLowerCase()
        .includes(searchText)

      ||

      user.job_role
        ?.toLowerCase()
        .includes(searchText);


    const matchesRole =

      roleFilter === "all"

      ||

      user.role === roleFilter;


    return matchesSearch && matchesRole;

  });


  return (

    <div className="container py-4">

      {/* Header */}

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>

          <h2 className="fw-bold mb-1">
            Admin Dashboard
          </h2>

          <p className="text-muted mb-0">
            Manage users and monitor the platform.
          </p>

        </div>


        <button
          className="btn btn-outline-secondary"
          onClick={() => navigate("/dashboard")}
        >
          Back to Dashboard
        </button>

      </div>


      {/* Error */}

      {error && (

        <div className="alert alert-danger">

          {error}

        </div>

      )}


      {/* Statistics */}

      {stats && (

        <div className="row g-3 mb-4">

          <div className="col-md-3">

            <div className="card shadow-sm border-0">

              <div className="card-body">

                <h6 className="text-muted">
                  Total Users
                </h6>

                <h2 className="fw-bold">
                  {stats.total_users}
                </h2>

              </div>

            </div>

          </div>


          <div className="col-md-3">

            <div className="card shadow-sm border-0">

              <div className="card-body">

                <h6 className="text-muted">
                  Students
                </h6>

                <h2 className="fw-bold">
                  {stats.total_students}
                </h2>

              </div>

            </div>

          </div>


          <div className="col-md-3">

            <div className="card shadow-sm border-0">

              <div className="card-body">

                <h6 className="text-muted">
                  Alumni
                </h6>

                <h2 className="fw-bold">
                  {stats.total_alumni}
                </h2>

              </div>

            </div>

          </div>


          <div className="col-md-3">

            <div className="card shadow-sm border-0">

              <div className="card-body">

                <h6 className="text-muted">
                  Admins
                </h6>

                <h2 className="fw-bold">
                  {stats.total_admins}
                </h2>

              </div>

            </div>

          </div>


          <div className="col-md-3">

            <div className="card shadow-sm border-0">

              <div className="card-body">

                <h6 className="text-muted">
                  Posts
                </h6>

                <h2 className="fw-bold">
                  {stats.total_posts}
                </h2>

              </div>

            </div>

          </div>


          <div className="col-md-3">

            <div className="card shadow-sm border-0">

              <div className="card-body">

                <h6 className="text-muted">
                  Jobs
                </h6>

                <h2 className="fw-bold">
                  {stats.total_jobs}
                </h2>

              </div>

            </div>

          </div>


          <div className="col-md-3">

            <div className="card shadow-sm border-0">

              <div className="card-body">

                <h6 className="text-muted">
                  Mentorships
                </h6>

                <h2 className="fw-bold">
                  {stats.total_mentorships}
                </h2>

              </div>

            </div>

          </div>


          <div className="col-md-3">

            <div className="card shadow-sm border-0">

              <div className="card-body">

                <h6 className="text-muted">
                  Messages
                </h6>

                <h2 className="fw-bold">
                  {stats.total_messages}
                </h2>

              </div>

            </div>

          </div>

        </div>

      )}


      {/* Users Section */}

      <div className="card shadow-sm border-0">

        <div className="card-body">

          <div className="d-flex justify-content-between align-items-center mb-3">

            <h4 className="fw-bold mb-0">
              All Users
            </h4>

            <span className="badge bg-secondary">
              {filteredUsers.length} users
            </span>

          </div>


          {/* Search and Filter */}

          <div className="row g-3 mb-4">

            <div className="col-md-8">

              <input
                type="text"
                className="form-control"
                placeholder="Search by name, email, department, company or job role"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />

            </div>


            <div className="col-md-4">

              <select
                className="form-select"
                value={roleFilter}
                onChange={(e) =>
                  setRoleFilter(e.target.value)
                }
              >

                <option value="all">
                  All Roles
                </option>

                <option value="student">
                  Student
                </option>

                <option value="alumni">
                  Alumni
                </option>

                <option value="admin">
                  Admin
                </option>

              </select>

            </div>

          </div>


          {/* Users Table */}

          {filteredUsers.length === 0 ? (

            <div className="text-center py-4">

              <p className="text-muted mb-0">
                No users found.
              </p>

            </div>

          ) : (

            <div className="table-responsive">

              <table className="table table-bordered table-hover align-middle">

                <thead className="table-light">

                  <tr>

                    <th>#</th>

                    <th>Name</th>

                    <th>Email</th>

                    <th>Role</th>

                    <th>Department</th>

                    <th>Company</th>

                    <th>Job Role</th>

                    <th>Admission Year</th>

                    <th>Graduation Year</th>

                    <th>Status</th>

                  </tr>

                </thead>


                <tbody>

                  {filteredUsers.map(
                    (user, index) => (

                      <tr key={user.id}>

                        <td>
                          {index + 1}
                        </td>

                        <td>
                          {user.full_name || "-"}
                        </td>

                        <td>
                          {user.email || "-"}
                        </td>

                        <td>

                          <span
                            className={
                              user.role === "admin"
                                ? "badge bg-danger"
                                : user.role === "alumni"
                                ? "badge bg-success"
                                : "badge bg-primary"
                            }
                          >
                            {user.role}
                          </span>

                        </td>

                        <td>
                          {user.department || "-"}
                        </td>

                        <td>
                          {user.company || "-"}
                        </td>

                        <td>
                          {user.job_role || "-"}
                        </td>

                        <td>
                          {user.admission_year || "-"}
                        </td>

                        <td>
                          {user.graduation_year || "-"}
                        </td>

                        <td>
                          {user.graduation_status || "-"}
                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>

    </div>

  );

}


export default AdminDashboard;