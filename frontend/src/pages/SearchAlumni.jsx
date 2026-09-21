import { useEffect, useState } from "react";

import api from "../services/api";


function SearchAlumni() {

    const [alumni, setAlumni] = useState([]);

    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    useEffect(() => {

        let isMounted = true;


        const loadAlumni = async () => {

            try {

                const response = await api.get(
                    "profiles/"
                );


                const alumniUsers = response.data.filter(
                    (user) => user.role === "alumni"
                );


                if (isMounted) {

                    setAlumni(alumniUsers);

                    setLoading(false);

                }

            } catch {

                if (isMounted) {

                    setError(
                        "Unable to load alumni."
                    );

                    setLoading(false);

                }

            }

        };


        loadAlumni();


        return () => {

            isMounted = false;

        };

    }, []);


    const filteredAlumni = alumni.filter(
        (user) => {

            const searchText =
                search.toLowerCase().trim();


            return (

                user.full_name
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
                    .includes(searchText)

                ||

                user.skills
                    ?.toLowerCase()
                    .includes(searchText)

            );

        }
    );


    return (

        <div className="container mt-4">

            <div className="d-flex justify-content-between align-items-center mb-4">

                <h2>
                    Search Alumni
                </h2>

            </div>


            <div className="mb-4">

                <input
                    type="text"
                    className="form-control"
                    placeholder="Search by name, department, company, job role or skills..."
                    value={search}
                    onChange={(e) =>
                        setSearch(e.target.value)
                    }
                />

            </div>


            {loading && (

                <div className="text-center">

                    <p>
                        Loading alumni...
                    </p>

                </div>

            )}


            {!loading && error && (

                <div className="alert alert-danger">

                    {error}

                </div>

            )}


            {!loading &&
                !error &&
                filteredAlumni.length === 0 && (

                    <div className="alert alert-info">

                        No alumni found.

                    </div>

                )}


            {!loading &&
                !error &&
                filteredAlumni.length > 0 && (

                    <div className="row">

                        {filteredAlumni.map(
                            (user) => (

                                <div
                                    className="col-md-6 col-lg-4 mb-4"
                                    key={user.id}
                                >

                                    <div className="card h-100 shadow-sm">

                                        <div className="card-body">

                                            <h5 className="card-title">

                                                {user.full_name}

                                            </h5>


                                            <p className="text-muted mb-2">

                                                Alumni

                                            </p>


                                            {user.department && (

                                                <p className="mb-2">

                                                    <strong>
                                                        Department:
                                                    </strong>{" "}

                                                    {user.department}

                                                </p>

                                            )}


                                            {user.company && (

                                                <p className="mb-2">

                                                    <strong>
                                                        Company:
                                                    </strong>{" "}

                                                    {user.company}

                                                </p>

                                            )}


                                            {user.job_role && (

                                                <p className="mb-2">

                                                    <strong>
                                                        Job Role:
                                                    </strong>{" "}

                                                    {user.job_role}

                                                </p>

                                            )}


                                            {user.graduation_year && (

                                                <p className="mb-2">

                                                    <strong>
                                                        Graduation Year:
                                                    </strong>{" "}

                                                    {user.graduation_year}

                                                </p>

                                            )}


                                            {user.skills && (

                                                <p className="mb-2">

                                                    <strong>
                                                        Skills:
                                                    </strong>{" "}

                                                    {user.skills}

                                                </p>

                                            )}


                                            {user.bio && (

                                                <p className="mb-0">

                                                    <strong>
                                                        Bio:
                                                    </strong>{" "}

                                                    {user.bio}

                                                </p>

                                            )}

                                        </div>

                                    </div>

                                </div>

                            )
                        )}

                    </div>

                )}

        </div>

    );

}


export default SearchAlumni;