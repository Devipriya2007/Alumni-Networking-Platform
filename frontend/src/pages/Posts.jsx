import { useEffect, useState } from "react";

import api from "../services/api";


function Posts() {

    const [posts, setPosts] = useState([]);

    const [profile, setProfile] = useState(null);

    const [content, setContent] = useState("");

    const [image, setImage] = useState(null);

    const [imagePreview, setImagePreview] = useState("");

    const [loading, setLoading] = useState(true);

    const [posting, setPosting] = useState(false);

    const [error, setError] = useState("");

    const [success, setSuccess] = useState("");


    useEffect(() => {

        let isMounted = true;


        const loadData = async () => {

            try {

                const [
                    postsResponse,
                    profileResponse
                ] = await Promise.all([

                    api.get("posts/"),

                    api.get("my-profile/"),

                ]);


                if (isMounted) {

                    setPosts(
                        postsResponse.data
                    );

                    setProfile(
                        profileResponse.data
                    );

                    setLoading(false);

                }

            } catch (err) {

                console.error(
                    "Load posts error:",
                    err.response?.data
                );

                if (isMounted) {

                    setError(
                        "Unable to load posts."
                    );

                    setLoading(false);

                }

            }

        };


        loadData();


        return () => {

            isMounted = false;

        };

    }, []);


    const handleImageChange = (e) => {

        const selectedImage =
            e.target.files[0];


        if (!selectedImage) {

            setImage(null);

            setImagePreview("");

            return;

        }


        if (
            !selectedImage.type.startsWith(
                "image/"
            )
        ) {

            setError(
                "Please select a valid image file."
            );

            setImage(null);

            setImagePreview("");

            return;

        }


        if (
            selectedImage.size >
            5 * 1024 * 1024
        ) {

            setError(
                "Image size must be less than 5 MB."
            );

            setImage(null);

            setImagePreview("");

            return;

        }


        setError("");

        setImage(selectedImage);


        const previewUrl =
            URL.createObjectURL(
                selectedImage
            );


        setImagePreview(
            previewUrl
        );

    };


    const removeImage = () => {

        setImage(null);

        setImagePreview("");


        const fileInput =
            document.getElementById(
                "postImage"
            );


        if (fileInput) {

            fileInput.value = "";

        }

    };


    const handleSubmit = async (e) => {

        e.preventDefault();


        setError("");

        setSuccess("");


        if (
            !content.trim() &&
            !image
        ) {

            setError(
                "Please enter some text or select an image."
            );

            return;

        }


        if (!profile) {

            setError(
                "Profile not found."
            );

            return;

        }


        setPosting(true);


        try {

            const formData =
                new FormData();


            formData.append(
                "content",
                content
            );


            formData.append(
                "post_type",
                profile.role
            );


            if (image) {

                formData.append(
                    "image",
                    image
                );

            }


            const response =
                await api.post(
                    "posts/",
                    formData,
                    {
                        headers: {
                            "Content-Type":
                                "multipart/form-data",
                        },
                    }
                );


            setPosts(
                (previousPosts) => [
                    response.data,
                    ...previousPosts,
                ]
            );


            setContent("");

            setImage(null);

            setImagePreview("");


            setSuccess(
                "Post created successfully."
            );


            const fileInput =
                document.getElementById(
                    "postImage"
                );


            if (fileInput) {

                fileInput.value = "";

            }

        } catch (err) {

            console.error(
                "Create post error:",
                err.response?.data
            );


            if (err.response?.data) {

                setError(
                    JSON.stringify(
                        err.response.data
                    )
                );

            } else {

                setError(
                    "Unable to connect to backend."
                );

            }

        } finally {

            setPosting(false);

        }

    };


    const handleDelete = async (postId) => {

        const confirmed =
            window.confirm(
                "Are you sure you want to delete this post?"
            );


        if (!confirmed) {

            return;

        }


        try {

            await api.delete(
                `posts/${postId}/`
            );


            setPosts(
                (previousPosts) =>
                    previousPosts.filter(
                        (post) =>
                            post.id !== postId
                    )
            );


            setSuccess(
                "Post deleted successfully."
            );

        } catch (err) {

            console.error(
                "Delete post error:",
                err.response?.data
            );


            setError(
                "Unable to delete post."
            );

        }

    };


    return (

        <div className="container mt-4 mb-5">

            <div className="row justify-content-center">

                <div className="col-lg-8">

                    <h2 className="mb-4">
                        Posts
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


                    <div className="card shadow-sm mb-4">

                        <div className="card-body">

                            <h5 className="card-title mb-3">

                                Create a Post

                            </h5>


                            <textarea
                                className="form-control mb-3"
                                rows="4"
                                placeholder="What's on your mind?"
                                value={content}
                                onChange={(e) =>
                                    setContent(
                                        e.target.value
                                    )
                                }
                            />


                            <div className="mb-3">

                                <label
                                    htmlFor="postImage"
                                    className="form-label"
                                >

                                    Add Image

                                </label>


                                <input
                                    id="postImage"
                                    type="file"
                                    className="form-control"
                                    accept="image/*"
                                    onChange={
                                        handleImageChange
                                    }
                                />


                                <small className="text-muted">

                                    Maximum image size: 5 MB

                                </small>

                            </div>


                            {imagePreview && (

                                <div className="mb-3">

                                    <div className="position-relative">

                                        <img
                                            src={imagePreview}
                                            alt="Post preview"
                                            className="img-fluid rounded"
                                            style={{
                                                maxHeight:
                                                    "350px",
                                                width:
                                                    "100%",
                                                objectFit:
                                                    "cover",
                                            }}
                                        />


                                        <button
                                            type="button"
                                            className="btn btn-danger btn-sm mt-2"
                                            onClick={
                                                removeImage
                                            }
                                        >

                                            Remove Image

                                        </button>

                                    </div>

                                </div>

                            )}


                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handleSubmit}
                                disabled={posting}
                            >

                                {posting
                                    ? "Posting..."
                                    : "Post"}

                            </button>

                        </div>

                    </div>


                    <h4 className="mb-3">

                        Recent Posts

                    </h4>


                    {loading && (

                        <div className="text-center">

                            <p>
                                Loading posts...
                            </p>

                        </div>

                    )}


                    {!loading &&
                        posts.length === 0 && (

                        <div className="alert alert-info">

                            No posts available.

                        </div>

                    )}


                    {!loading &&
                        posts.length > 0 && (

                        <div>

                            {posts.map(
                                (post) => (

                                    <div
                                        className="card shadow-sm mb-4"
                                        key={post.id}
                                    >

                                        <div className="card-body">

                                            <div className="d-flex justify-content-between align-items-start mb-2">

                                                <div>

                                                    <h6 className="mb-1">

                                                        User ID:{" "}
                                                        {post.user}

                                                    </h6>


                                                    <small className="text-muted">

                                                        {post.post_type}

                                                    </small>

                                                </div>


                                                {profile &&
                                                    post.user ===
                                                        profile.user && (

                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() =>
                                                            handleDelete(
                                                                post.id
                                                            )
                                                        }
                                                    >

                                                        Delete

                                                    </button>

                                                )}

                                            </div>


                                            {post.content && (

                                                <p className="mb-3">

                                                    {post.content}

                                                </p>

                                            )}


                                            {post.image && (

                                                <div className="mb-2">

                                                    <img
                                                        src={
                                                            post.image.startsWith(
                                                                "http"
                                                            )
                                                                ? post.image
                                                                : `http://127.0.0.1:8000${post.image}`
                                                        }
                                                        alt="Post"
                                                        className="img-fluid rounded"
                                                        style={{
                                                            maxHeight:
                                                                "500px",
                                                            width:
                                                                "100%",
                                                            objectFit:
                                                                "cover",
                                                        }}
                                                    />

                                                </div>

                                            )}

                                        </div>

                                    </div>

                                )
                            )}

                        </div>

                    )}

                </div>

            </div>

        </div>

    );

}


export default Posts;