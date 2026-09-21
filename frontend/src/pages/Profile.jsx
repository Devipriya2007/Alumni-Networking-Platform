import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";


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

                const token =
                    localStorage.getItem("access_token");


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


                if (isMounted) {

                    setProfile(response.data);

                    setFormData(response.data);

                    setLoading(false);

                }

            } catch (err) {

                if (!isMounted) {
                    return;
                }


                if (
                    err.response?.status === 401
                ) {

                    localStorage.removeItem(
                        "access_token"
                    );

                    localStorage.removeItem(
                        "refresh_token"
                    );

                    navigate("/login");

                    return;

                }


                setError(
                    "Unable to load profile."
                );

                setLoading(false);

            }

        };


        loadProfile();


        return () => {

            isMounted = false;

        };

    }, [navigate]);


    const handleChange = (e) => {

        const {
            name,
            value
        } = e.target;


        setFormData(
            (previous) => ({
                ...previous,
                [name]: value,
            })
        );

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

            const token =
                localStorage.getItem("access_token");


            const data = {

                full_name:
                    formData.full_name,

                department:
                    formData.department || "",

                admission_year:
                    formData.admission_year
                        ? Number(
                            formData.admission_year
                        )
                        : null,

                graduation_year:
                    formData.graduation_year
                        ? Number(
                            formData.graduation_year
                        )
                        : null,

                company:
                    formData.company || "",

                job_role:
                    formData.job_role || "",

                skills:
                    formData.skills || "",

                bio:
                    formData.bio || "",

            };


            const response = await api.put(
                "my-profile/",
                data,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                }
            );


            setProfile(response.data);

            setFormData(response.data);

            setEditing(false);

            setSuccess(
                "Profile updated successfully."
            );


        } catch (err) {

            if (
                err.response?.status === 401
            ) {

                localStorage.removeItem(
                    "access_token"
                );

                localStorage.removeItem(
                    "refresh_token"
                );

                navigate("/login");

                return;

            }


            setError(
                "Unable to update profile."
            );

        } finally {

            setSaving(false);

        }

    };


    if (loading) {

        return (

            <div className="container mt-5">

                <div className="text-center">

                    <p>
                        Loading profile...
                    </p>

                </div>

            </div>

        );

    }


    if (!profile) {

        return (

            <div className="container mt-5">

                <div className="alert alert-danger">

                    {error || "Profile not found."}

                </div>

            </div>

        );

    }


    return (

        <div className="container mt-4 mb-5">

            <div className="row justify-content-center">

                <div className="col-md-8">

                    <div className="card shadow-sm">

                        <div className="card-body p-4">

                            <div className="d-flex justify-content-between align-items-center mb-4">

                                <h2>
                                    My Profile
                                </h2>

                                {!editing && (

                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={handleEdit}
                                    >
                                        Edit Profile
                                    </button>

                                )}

                            </div>


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


                            {!editing ? (

                                <div>

                                    {/* Full Name */}

                                    <div className="mb-3">

                                        <strong>
                                            Full Name
                                        </strong>

                                        <p className="mb-0">

                                            {profile.full_name || "-"}

                                        </p>

                                    </div>


                                    {/* Email */}

                                    <div className="mb-3">

                                        <strong>
                                            Email
                                        </strong>

                                        <p className="mb-0">

                                            {profile.email || "-"}

                                        </p>

                                    </div>


                                    {/* Role */}

                                    <div className="mb-3">

                                        <strong>
                                            Role
                                        </strong>

                                        <p className="mb-0 text-capitalize">

                                            {profile.role || "-"}

                                        </p>

                                    </div>


                                    {/* Department */}

                                    {profile.role !== "admin" && (

                                        <div className="mb-3">

                                            <strong>
                                                Department
                                            </strong>

                                            <p className="mb-0">

                                                {profile.department || "-"}

                                            </p>

                                        </div>

                                    )}


                                    {/* Admission Year */}

                                    {profile.role !== "admin" && (

                                        <div className="mb-3">

                                            <strong>
                                                Admission Year
                                            </strong>

                                            <p className="mb-0">

                                                {profile.admission_year || "-"}

                                            </p>

                                        </div>

                                    )}


                                    {/* Graduation Year */}

                                    {profile.role !== "admin" && (

                                        <div className="mb-3">

                                            <strong>
                                                Graduation Year
                                            </strong>

                                            <p className="mb-0">

                                                {profile.graduation_year || "-"}

                                            </p>

                                        </div>

                                    )}


                                    {/* Graduation Status */}

                                    {profile.role !== "admin" && (

                                        <div className="mb-3">

                                            <strong>
                                                Graduation Status
                                            </strong>

                                            <p className="mb-0 text-capitalize">

                                                {profile.graduation_status || "-"}

                                            </p>

                                        </div>

                                    )}


                                    {/* Company */}

                                    {profile.role === "alumni" && (

                                        <div className="mb-3">

                                            <strong>
                                                Company
                                            </strong>

                                            <p className="mb-0">

                                                {profile.company || "-"}

                                            </p>

                                        </div>

                                    )}


                                    {/* Job Role */}

                                    {profile.role === "alumni" && (

                                        <div className="mb-3">

                                            <strong>
                                                Job Role / Designation
                                            </strong>

                                            <p className="mb-0">

                                                {profile.job_role || "-"}

                                            </p>

                                        </div>

                                    )}


                                    {/* Skills */}

                                    {profile.role === "alumni" && (

                                        <div className="mb-3">

                                            <strong>
                                                Skills
                                            </strong>

                                            <p className="mb-0">

                                                {profile.skills || "-"}

                                            </p>

                                        </div>

                                    )}


                                    {/* Bio */}

                                    {profile.role === "alumni" && (

                                        <div className="mb-3">

                                            <strong>
                                                Bio
                                            </strong>

                                            <p className="mb-0">

                                                {profile.bio || "-"}

                                            </p>

                                        </div>

                                    )}

                                </div>

                            ) : (

                                <form onSubmit={handleSave}>

                                    {/* Full Name */}

                                    <div className="mb-3">

                                        <label className="form-label">

                                            Full Name

                                        </label>

                                        <input
                                            type="text"
                                            name="full_name"
                                            className="form-control"
                                            value={
                                                formData.full_name || ""
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            required
                                        />

                                    </div>


                                    {/* Email */}

                                    <div className="mb-3">

                                        <label className="form-label">

                                            Email

                                        </label>

                                        <input
                                            type="email"
                                            className="form-control"
                                            value={
                                                formData.email || ""
                                            }
                                            readOnly
                                        />

                                    </div>


                                    {/* Role */}

                                    <div className="mb-3">

                                        <label className="form-label">

                                            Role

                                        </label>

                                        <input
                                            type="text"
                                            className="form-control text-capitalize"
                                            value={
                                                formData.role || ""
                                            }
                                            readOnly
                                        />

                                    </div>


                                    {/* Student + Alumni */}

                                    {profile.role !== "admin" && (

                                        <>

                                            {/* Department */}

                                            <div className="mb-3">

                                                <label className="form-label">

                                                    Department

                                                </label>

                                                <input
                                                    type="text"
                                                    name="department"
                                                    className="form-control"
                                                    value={
                                                        formData.department || ""
                                                    }
                                                    onChange={
                                                        handleChange
                                                    }
                                                />

                                            </div>


                                            {/* Admission Year */}

                                            <div className="mb-3">

                                                <label className="form-label">

                                                    Admission Year

                                                </label>

                                                <input
                                                    type="number"
                                                    name="admission_year"
                                                    className="form-control"
                                                    value={
                                                        formData.admission_year || ""
                                                    }
                                                    onChange={
                                                        handleChange
                                                    }
                                                />

                                            </div>


                                            {/* Graduation Year */}

                                            <div className="mb-3">

                                                <label className="form-label">

                                                    Graduation Year

                                                </label>

                                                <input
                                                    type="number"
                                                    name="graduation_year"
                                                    className="form-control"
                                                    value={
                                                        formData.graduation_year || ""
                                                    }
                                                    onChange={
                                                        handleChange
                                                    }
                                                />

                                            </div>


                                            {/* Graduation Status */}

                                            <div className="mb-3">

                                                <label className="form-label">

                                                    Graduation Status

                                                </label>

                                                <input
                                                    type="text"
                                                    className="form-control text-capitalize"
                                                    value={
                                                        formData.graduation_status || ""
                                                    }
                                                    readOnly
                                                />

                                            </div>

                                        </>

                                    )}


                                    {/* Alumni */}

                                    {profile.role === "alumni" && (

                                        <>

                                            {/* Company */}

                                            <div className="mb-3">

                                                <label className="form-label">

                                                    Company

                                                </label>

                                                <input
                                                    type="text"
                                                    name="company"
                                                    className="form-control"
                                                    value={
                                                        formData.company || ""
                                                    }
                                                    onChange={
                                                        handleChange
                                                    }
                                                />

                                            </div>


                                            {/* Job Role */}

                                            <div className="mb-3">

                                                <label className="form-label">

                                                    Job Role / Designation

                                                </label>

                                                <input
                                                    type="text"
                                                    name="job_role"
                                                    className="form-control"
                                                    value={
                                                        formData.job_role || ""
                                                    }
                                                    onChange={
                                                        handleChange
                                                    }
                                                    placeholder="Example: Software Engineer"
                                                />

                                            </div>


                                            {/* Skills */}

                                            <div className="mb-3">

                                                <label className="form-label">

                                                    Skills

                                                </label>

                                                <textarea
                                                    name="skills"
                                                    className="form-control"
                                                    rows="3"
                                                    value={
                                                        formData.skills || ""
                                                    }
                                                    onChange={
                                                        handleChange
                                                    }
                                                    placeholder="Example: Java, Python, SQL"
                                                />

                                            </div>


                                            {/* Bio */}

                                            <div className="mb-3">

                                                <label className="form-label">

                                                    Bio

                                                </label>

                                                <textarea
                                                    name="bio"
                                                    className="form-control"
                                                    rows="3"
                                                    value={
                                                        formData.bio || ""
                                                    }
                                                    onChange={
                                                        handleChange
                                                    }
                                                    placeholder="Tell something about yourself"
                                                />

                                            </div>

                                        </>

                                    )}


                                    {/* Buttons */}

                                    <div className="d-flex gap-2">

                                        <button
                                            type="submit"
                                            className="btn btn-success"
                                            disabled={saving}
                                        >

                                            {saving
                                                ? "Saving..."
                                                : "Save Changes"}

                                        </button>


                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={handleCancel}
                                            disabled={saving}
                                        >

                                            Cancel

                                        </button>

                                    </div>

                                </form>

                            )}

                        </div>

                    </div>

                </div>

            </div>

        </div>

    );

}


export default Profile;