
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
        const [postsResponse, profileResponse] =
          await Promise.all([
            api.get("posts/"),
            api.get("my-profile/"),
          ]);

        if (isMounted) {
          setPosts(postsResponse.data);
          setProfile(profileResponse.data);
          setLoading(false);
        }
      } catch (err) {
        console.error("Load posts error:", err);

        if (isMounted) {
          setError("Unable to load posts.");
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!imagePreview) return;

    return () => {
      URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const getInitials = (name) =>
    (name || "Alumni")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0].toUpperCase())
      .join("");

  const handleImageChange = (e) => {
    const selectedImage = e.target.files[0];

    if (!selectedImage) {
      setImage(null);
      setImagePreview("");
      return;
    }

    if (!selectedImage.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      setImage(null);
      setImagePreview("");
      e.target.value = "";
      return;
    }

    if (selectedImage.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5 MB.");
      setImage(null);
      setImagePreview("");
      e.target.value = "";
      return;
    }

    setError("");
    setImage(selectedImage);
    setImagePreview(URL.createObjectURL(selectedImage));
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview("");

    const fileInput = document.getElementById("postImage");

    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!content.trim() && !image) {
      setError("Please enter some text or select an image.");
      return;
    }

    if (!profile) {
      setError("Profile not found.");
      return;
    }

    setPosting(true);

    try {
      const formData = new FormData();

      formData.append("content", content);
      formData.append("post_type", profile.role);

      if (image) {
        formData.append("image", image);
      }

      const response = await api.post("posts/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setPosts((previousPosts) => [
        response.data,
        ...previousPosts,
      ]);

      setContent("");
      setImage(null);
      setImagePreview("");

      setSuccess("Your post has been published!");

      const fileInput = document.getElementById("postImage");

      if (fileInput) {
        fileInput.value = "";
      }
    } catch (err) {
      console.error("Create post error:", err.response?.data);

      if (err.response?.data) {
        setError(JSON.stringify(err.response.data));
      } else {
        setError("Unable to connect to backend.");
      }
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (postId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this post?"
      )
    ) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      await api.delete(`posts/${postId}/`);

      setPosts((previousPosts) =>
        previousPosts.filter((post) => post.id !== postId)
      );

      setSuccess("Post deleted successfully.");
    } catch (err) {
      console.error("Delete post error:", err.response?.data);
      setError("Unable to delete post.");
    }
  };

  const getPostImageUrl = (imageUrl) => {
    if (!imageUrl) return "";

    if (/^https?:\/\//i.test(imageUrl)) {
      return imageUrl;
    }

    const baseURL = api.defaults.baseURL || "";
    const apiRoot = baseURL.replace(/\/api\/?$/, "");

    return `${apiRoot.replace(/\/$/, "")}/${imageUrl.replace(
      /^\//,
      ""
    )}`;
  };

  return (
    <div className="al-feed">
      <style>{`
        .al-feed {
          min-height: 100vh;
          padding: 34px 22px 60px;
          background: #f4f6fb;
          color: #202c43;
          font-family: Inter, "Segoe UI", sans-serif;
        }

        .al-container {
          max-width: 1080px;
          margin: 0 auto;
        }

        .al-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 36px;
        }

        .al-brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .al-brand-icon {
          display: grid;
          place-items: center;
          width: 46px;
          height: 46px;
          border-radius: 15px;
          color: white;
          font-size: 25px;
          font-weight: 800;
          background: linear-gradient(135deg, #3865ee, #7654e9);
          box-shadow: 0 8px 20px #5364e52b;
        }

        .al-brand h2 {
          margin: 0;
          font-size: 21px;
          font-weight: 800;
          letter-spacing: -.6px;
        }

        .al-brand p {
          margin: 3px 0 0;
          font-size: 12px;
          color: #8792a7;
        }

        .al-top-label {
          padding: 10px 15px;
          background: white;
          border: 1px solid #e6eaf2;
          border-radius: 12px;
          color: #586680;
          font-size: 12px;
          font-weight: 650;
        }

        .al-heading {
          margin-bottom: 26px;
        }

        .al-heading .al-eyebrow {
          color: #5a65df;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-bottom: 9px;
        }

        .al-heading h1 {
          font-size: clamp(27px, 4vw, 37px);
          font-weight: 850;
          letter-spacing: -1.2px;
          margin: 0 0 9px;
        }

        .al-heading p {
          color: #8590a4;
          font-size: 14px;
          margin: 0;
          line-height: 1.7;
        }

        .al-layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 285px;
          gap: 24px;
          align-items: start;
        }

        .al-main {
          min-width: 0;
        }

        .al-card {
          background: white;
          border: 1px solid #e7ebf3;
          border-radius: 20px;
          box-shadow: 0 8px 28px #263d6b08;
          overflow: hidden;
        }

        .al-create {
          padding: 23px;
          margin-bottom: 28px;
        }

        .al-create-title {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 19px;
        }

        .al-avatar {
          display: grid;
          place-items: center;
          flex-shrink: 0;
          width: 44px;
          height: 44px;
          border-radius: 15px;
          background: linear-gradient(135deg, #e2eaff, #eee5ff);
          color: #4e60d9;
          font-size: 13px;
          font-weight: 800;
        }

        .al-create-title h3 {
          font-size: 15px;
          font-weight: 800;
          margin: 0 0 5px;
        }

        .al-create-title p {
          font-size: 12px;
          color: #8994a8;
          margin: 0;
        }

        .al-textarea {
          width: 100%;
          min-height: 130px;
          resize: vertical;
          padding: 16px;
          border: 1px solid #e8ecf4;
          border-radius: 15px;
          outline: none;
          background: #fafbfe;
          color: #28344b;
          font-size: 14px;
          line-height: 1.7;
          transition: .2s;
        }

        .al-textarea:focus {
          border-color: #aebeff;
          box-shadow: 0 0 0 3px #4b68ed10;
          background: white;
        }

        .al-textarea::placeholder {
          color: #a0a9b9;
        }

        .al-image-preview {
          position: relative;
          margin-top: 15px;
          padding: 8px;
          border: 1px solid #e7ebf3;
          border-radius: 15px;
          background: #fafbfe;
        }

        .al-image-preview img {
          display: block;
          width: 100%;
          max-height: 320px;
          object-fit: contain;
          border-radius: 10px;
        }

        .al-remove-image {
          margin-top: 9px;
          border: 0;
          border-radius: 9px;
          padding: 8px 12px;
          background: #fff0f1;
          color: #bc3947;
          font-size: 12px;
          font-weight: 700;
        }

        .al-create-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 13px;
          margin-top: 17px;
        }

        .al-upload-label {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          padding: 10px 13px;
          border: 1px solid #e7ebf3;
          border-radius: 11px;
          background: white;
          color: #65728b;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: .2s;
        }

        .al-upload-label:hover {
          background: #f3f6ff;
          border-color: #cbd7ff;
          color: #4a61d7;
        }

        .al-upload-label input {
          display: none;
        }

        .al-upload-note {
          display: block;
          margin-top: 8px;
          color: #9aa4b6;
          font-size: 11px;
        }

        .al-publish {
          border: 0;
          border-radius: 12px;
          padding: 12px 20px;
          color: white;
          font-size: 12px;
          font-weight: 800;
          background: linear-gradient(135deg, #4169ef, #6650e5);
          box-shadow: 0 6px 15px #4e60e52b;
          transition: .2s;
        }

        .al-publish:hover {
          transform: translateY(-1px);
          filter: brightness(1.06);
        }

        .al-publish:disabled {
          opacity: .6;
          cursor: not-allowed;
          transform: none;
        }

        .al-feed-title {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .al-feed-title h2 {
          margin: 0;
          font-size: 19px;
          font-weight: 850;
          letter-spacing: -.4px;
        }

        .al-feed-count {
          padding: 6px 10px;
          border-radius: 9px;
          background: #e9efff;
          color: #4d64dd;
          font-size: 11px;
          font-weight: 800;
        }

        .al-post {
          margin-bottom: 18px;
        }

        .al-post-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 21px 22px 15px;
        }

        .al-post-person {
          flex: 1;
          min-width: 0;
        }

        .al-post-person h3 {
          margin: 0 0 5px;
          color: #26334b;
          font-size: 14px;
          font-weight: 800;
          overflow-wrap: anywhere;
        }

        .al-post-meta {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 7px;
          color: #8b96a9;
          font-size: 11px;
        }

        .al-role {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 7px;
          background: #eef2ff;
          color: #5566d8;
          font-size: 10px;
          font-weight: 800;
          text-transform: capitalize;
        }

        .al-delete {
          flex-shrink: 0;
          padding: 8px 11px;
          border: 1px solid #f1dfe2;
          border-radius: 10px;
          background: white;
          color: #c64c5a;
          font-size: 11px;
          font-weight: 750;
          transition: .2s;
        }

        .al-delete:hover {
          background: #fff0f1;
        }

        .al-post-content {
          padding: 0 22px 18px;
          margin: 0;
          color: #46536b;
          font-size: 14px;
          line-height: 1.85;
          white-space: pre-wrap;
          overflow-wrap: anywhere;
        }

        .al-post-image {
          display: block;
          width: 100%;
          max-height: 520px;
          object-fit: contain;
          background: #f7f8fc;
          border-top: 1px solid #f0f2f7;
          border-bottom: 1px solid #f0f2f7;
        }

        .al-post-footer {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 14px 22px;
          color: #9aa4b5;
          font-size: 11px;
        }

        .al-side-card {
          padding: 21px;
          margin-bottom: 17px;
        }

        .al-side-icon {
          display: grid;
          place-items: center;
          width: 43px;
          height: 43px;
          margin-bottom: 14px;
          border-radius: 14px;
          background: #edf1ff;
          color: #5266df;
          font-size: 21px;
        }

        .al-side-card h3 {
          margin: 0 0 9px;
          font-size: 14px;
          font-weight: 850;
        }

        .al-side-card p {
          margin: 0;
          color: #8792a6;
          font-size: 12px;
          line-height: 1.8;
        }

        .al-tip {
          padding: 17px;
          border-radius: 17px;
          background: linear-gradient(140deg, #eaf0ff, #f4efff);
          border: 1px solid #e5e8ff;
        }

        .al-tip h3 {
          margin: 0 0 8px;
          font-size: 13px;
          font-weight: 850;
          color: #3e4b9d;
        }

        .al-tip p {
          margin: 0;
          color: #6975a6;
          font-size: 12px;
          line-height: 1.8;
        }

        .al-alert {
          margin-bottom: 17px;
          padding: 13px 16px;
          border-radius: 12px;
          font-size: 13px;
          overflow-wrap: anywhere;
        }

        .al-alert.error {
          color: #b42332;
          background: #fff0f1;
          border: 1px solid #ffd8dd;
        }

        .al-alert.success {
          color: #15734e;
          background: #eafaf2;
          border: 1px solid #c8f0dc;
        }

        .al-empty {
          padding: 42px 20px;
          text-align: center;
          background: white;
          border: 1px solid #e7ebf3;
          border-radius: 20px;
        }

        .al-empty-icon {
          display: grid;
          place-items: center;
          width: 62px;
          height: 62px;
          margin: 0 auto 16px;
          border-radius: 20px;
          background: #edf1ff;
          color: #5266df;
          font-size: 26px;
        }

        .al-empty h3 {
          margin: 0 0 9px;
          font-size: 16px;
          font-weight: 800;
        }

        .al-empty p {
          margin: 0;
          color: #8792a6;
          font-size: 13px;
          line-height: 1.7;
        }

        .al-loading {
          padding: 35px;
          text-align: center;
          color: #8490a5;
          font-size: 13px;
        }

        .al-spinner {
          width: 32px;
          height: 32px;
          margin: 0 auto 12px;
          border: 3px solid #dce5ff;
          border-top-color: #4c68ef;
          border-radius: 50%;
          animation: al-spin .8s linear infinite;
        }

        @keyframes al-spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 850px) {
          .al-layout {
            grid-template-columns: 1fr;
          }

          .al-sidebar {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
          }

          .al-side-card {
            margin-bottom: 0;
          }
        }

        @media (max-width: 560px) {
          .al-feed {
            padding: 22px 12px 40px;
          }

          .al-topbar {
            margin-bottom: 27px;
          }

          .al-brand h2 {
            font-size: 18px;
          }

          .al-brand-icon {
            width: 40px;
            height: 40px;
          }

          .al-top-label {
            padding: 9px;
            font-size: 10px;
          }

          .al-create {
            padding: 16px;
          }

          .al-post-header {
            padding: 17px 15px 13px;
          }

          .al-post-content {
            padding: 0 15px 16px;
          }

          .al-post-footer {
            padding: 12px 15px;
          }

          .al-sidebar {
            grid-template-columns: 1fr;
          }

          .al-create-footer {
            align-items: flex-start;
          }

          .al-publish {
            padding: 12px 15px;
          }

          .al-delete {
            padding: 7px 8px;
          }
        }
      `}</style>

      <div className="al-container">
        <header className="al-topbar">
          <div className="al-brand">
            <div className="al-brand-icon">A</div>

            <div>
              <h2>AlumniLoop</h2>
              <p>Your professional community</p>
            </div>
          </div>

          <div className="al-top-label">
            ✦ Community Feed
          </div>
        </header>

        <section className="al-heading">
          <div className="al-eyebrow">
            Connect · Share · Grow
          </div>

          <h1>Ideas worth sharing.</h1>

          <p>
            Discover updates, share your journey, and inspire
            your alumni community.
          </p>
        </section>

        {error && (
          <div className="al-alert error">
            {error}
          </div>
        )}

        {success && (
          <div className="al-alert success">
            {success}
          </div>
        )}

        <div className="al-layout">
          <main className="al-main">
            <section className="al-card al-create">
              <div className="al-create-title">
                <div className="al-avatar">
                  {getInitials(profile?.full_name)}
                </div>

                <div>
                  <h3>
                    Share with your community
                  </h3>

                  <p>
                    A thought, an achievement, or a new opportunity.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <textarea
                  className="al-textarea"
                  rows="4"
                  placeholder="What's happening in your professional journey?"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />

                {imagePreview && (
                  <div className="al-image-preview">
                    <img
                      src={imagePreview}
                      alt="Post preview"
                    />

                    <button
                      type="button"
                      className="al-remove-image"
                      onClick={removeImage}
                    >
                      ✕ Remove image
                    </button>
                  </div>
                )}

                <div className="al-create-footer">
                  <div>
                    <label
                      className="al-upload-label"
                      htmlFor="postImage"
                    >
                      <span>▧</span>
                      Add a photo

                      <input
                        id="postImage"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </label>

                    <small className="al-upload-note">
                      JPG, PNG or other image · Max 5 MB
                    </small>
                  </div>

                  <button
                    type="submit"
                    className="al-publish"
                    disabled={posting}
                  >
                    {posting
                      ? "Publishing..."
                      : "Publish post  ↗"}
                  </button>
                </div>
              </form>
            </section>

            <div className="al-feed-title">
              <h2>Community feed</h2>

              <span className="al-feed-count">
                {posts.length} {posts.length === 1 ? "POST" : "POSTS"}
              </span>
            </div>

            {loading && (
              <div className="al-card al-loading">
                <div className="al-spinner" />
                Loading your community feed...
              </div>
            )}

            {!loading && posts.length === 0 && (
              <div className="al-empty">
                <div className="al-empty-icon">✦</div>

                <h3>Your community starts here</h3>

                <p>
                  No posts yet. Share the first update and
                  start a conversation with your alumni community.
                </p>
              </div>
            )}

            {!loading &&
              posts.map((post) => {
                const isOwner =
                  profile &&
                  Number(post.user) === Number(profile.user);

                return (
                  <article
                    className="al-card al-post"
                    key={post.id}
                  >
                    <div className="al-post-header">
                      <div className="al-avatar">
                        {getInitials(
                          isOwner ? profile?.full_name : ""
                        )}
                      </div>

                      <div className="al-post-person">
                        <h3>
                          {isOwner
                            ? profile?.full_name
                            : `Community Member #${post.user}`}
                        </h3>

                        <div className="al-post-meta">
                          <span className="al-role">
                            {post.post_type || "Member"}
                          </span>

                          <span>·</span>

                          <span>AlumniLoop community</span>
                        </div>
                      </div>

                      {isOwner && (
                        <button
                          type="button"
                          className="al-delete"
                          onClick={() => handleDelete(post.id)}
                        >
                          Delete
                        </button>
                      )}
                    </div>

                    {post.content && (
                      <p className="al-post-content">
                        {post.content}
                      </p>
                    )}

                    {post.image && (
                      <img
                        src={getPostImageUrl(post.image)}
                        alt="Post attachment"
                        className="al-post-image"
                        loading="lazy"
                      />
                    )}

                    <div className="al-post-footer">
                      <span>✦</span>
                      <span>
                        Shared with the AlumniLoop community
                      </span>
                    </div>
                  </article>
                );
              })}
          </main>

          <aside className="al-sidebar">
            <section className="al-card al-side-card">
              <div className="al-side-icon">◎</div>

              <h3>Your community, your network</h3>

              <p>
                Share your experiences, celebrate milestones,
                and discover opportunities through your alumni
                community.
              </p>
            </section>

            <section className="al-card al-side-card">
              <div className="al-side-icon">↗</div>

              <h3>Make your post count</h3>

              <p>
                Share useful resources, career lessons,
                internship updates, or advice that could help
                another student.
              </p>
            </section>

            <section className="al-tip">
              <h3>✦ Community tip</h3>

              <p>
                One helpful post can open the door to a new
                connection. Share something valuable today.
              </p>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default Posts;
