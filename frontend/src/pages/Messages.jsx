import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Messages() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [messages, setMessages] = useState([]);

  const [selectedUser, setSelectedUser] = useState("");
  const [content, setContent] = useState("");

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const token =
          localStorage.getItem("access_token");

        if (!token) {
          navigate("/login");
          return;
        }

        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const profileResponse = await api.get(
          "my-profile/",
          config
        );

        if (!isMounted) {
          return;
        }

        setProfile(profileResponse.data);

        const profilesResponse = await api.get(
          "profiles/"
        );

        if (!isMounted) {
          return;
        }

        setProfiles(profilesResponse.data);

        const messagesResponse = await api.get(
          "messages/",
          config
        );

        if (!isMounted) {
          return;
        }

        setMessages(messagesResponse.data);
      } catch (error) {
        console.error(
          "Messages loading error:",
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
        } else {
          setError(
            "Unable to load messages."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const getProfileName = (profileId) => {
    const foundProfile = profiles.find(
      (item) => item.id === profileId
    );

    if (foundProfile) {
      return foundProfile.full_name;
    }

    return `Profile ${profileId}`;
  };

  const selectedProfile = profiles.find(
    (item) =>
      item.id === Number(selectedUser)
  );

  const chatMessages = messages.filter(
    (item) => {
      if (!profile || !selectedUser) {
        return false;
      }

      const selectedId =
        Number(selectedUser);

      return (
        (item.sender === profile.id &&
          item.receiver === selectedId) ||
        (item.sender === selectedId &&
          item.receiver === profile.id)
      );
    }
  );

  const handleSendMessage = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!selectedUser) {
      setError(
        "Please select a user."
      );
      return;
    }

    if (!content.trim()) {
      setError(
        "Please enter a message."
      );
      return;
    }

    if (!profile) {
      setError(
        "Profile not loaded."
      );
      return;
    }

    setSending(true);

    try {
      const token =
        localStorage.getItem(
          "access_token"
        );

      const response = await api.post(
        "messages/",
        {
          sender: profile.id,
          receiver: Number(selectedUser),
          content: content.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessages(
        (previousMessages) => [
          ...previousMessages,
          response.data,
        ]
      );

      setContent("");

      setSuccess(
        "Message sent successfully."
      );
    } catch (error) {
      console.error(
        "Send message error:",
        error
      );

      if (error.response) {
        setError(
          "Unable to send message: " +
            JSON.stringify(
              error.response.data
            )
        );
      } else {
        setError(
          "Unable to connect to the backend."
        );
      }
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <h4>
            Loading messages...
          </h4>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5 mb-5">

      <div className="d-flex justify-content-between align-items-center mb-4">

        <h2>Messages</h2>

        <button
          className="btn btn-secondary"
          onClick={() =>
            navigate("/dashboard")
          }
        >
          Back to Dashboard
        </button>

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

      <div className="card shadow-sm">

        <div className="card-body">

          {/* Select User */}

          <div className="mb-4">

            <label className="form-label">
              Select User
            </label>

            <select
              className="form-select"
              value={selectedUser}
              onChange={(e) => {
                setSelectedUser(
                  e.target.value
                );

                setError("");
                setSuccess("");
              }}
            >

              <option value="">
                Select Student / Alumni
              </option>

              {profiles
                .filter(
                  (item) =>
                    profile &&
                    item.id !== profile.id
                )
                .map((item) => (
                  <option
                    key={item.id}
                    value={item.id}
                  >
                    {item.full_name} -{" "}
                    {item.role}
                  </option>
                ))}

            </select>

          </div>

          {/* Chat Header */}

          {selectedProfile && (
            <div className="border rounded p-3 mb-3 bg-light">

              <h5 className="mb-0">
                {selectedProfile.full_name}
              </h5>

              <small className="text-muted">
                {selectedProfile.role}
              </small>

            </div>
          )}

          {/* Chat Area */}

          <div
            className="border rounded p-3 mb-3"
            style={{
              height: "400px",
              overflowY: "auto",
              backgroundColor: "#f8f9fa",
            }}
          >

            {!selectedUser ? (

              <div className="text-center text-muted mt-5">

                <h5>
                  Select a user to start chatting
                </h5>

              </div>

            ) : chatMessages.length === 0 ? (

              <div className="text-center text-muted mt-5">

                <p>
                  No messages with{" "}
                  <strong>
                    {selectedProfile?.full_name}
                  </strong>
                  .
                </p>

                <p>
                  Start the conversation.
                </p>

              </div>

            ) : (

              chatMessages.map((item) => {

                const isSent =
                  item.sender === profile?.id;

                return (
                  <div
                    key={item.id}
                    className={`d-flex mb-3 ${
                      isSent
                        ? "justify-content-end"
                        : "justify-content-start"
                    }`}
                  >

                    <div
                      className={`p-3 rounded ${
                        isSent
                          ? "bg-primary text-white"
                          : "bg-white border"
                      }`}
                      style={{
                        maxWidth: "70%",
                      }}
                    >

                      <div className="small mb-1">
                        <strong>
                          {isSent
                            ? "You"
                            : getProfileName(
                                item.sender
                              )}
                        </strong>
                      </div>

                      <div>
                        {item.content}
                      </div>

                    </div>

                  </div>
                );
              })

            )}

          </div>

          {/* Send Message */}

          {selectedUser && (
            <form
              onSubmit={handleSendMessage}
            >

              <div className="input-group">

                <input
                  type="text"
                  className="form-control"
                  placeholder="Type your message..."
                  value={content}
                  onChange={(e) =>
                    setContent(
                      e.target.value
                    )
                  }
                />

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={sending}
                >
                  {sending
                    ? "Sending..."
                    : "Send"}
                </button>

              </div>

            </form>
          )}

        </div>

      </div>

    </div>
  );
}

export default Messages;