
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
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const token = localStorage.getItem("access_token");

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

        if (!isMounted) return;
        setProfile(profileResponse.data);

        const profilesResponse = await api.get("profiles/");

        if (!isMounted) return;
        setProfiles(profilesResponse.data);

        const messagesResponse = await api.get(
          "messages/",
          config
        );

        if (!isMounted) return;
        setMessages(messagesResponse.data);
      } catch (err) {
        console.error("Messages loading error:", err);

        if (!isMounted) return;

        if (err.response?.status === 401) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          navigate("/login");
        } else {
          setError("Unable to load messages.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const getProfileName = (profileId) => {
    const found = profiles.find(
      (item) => Number(item.id) === Number(profileId)
    );

    return found?.full_name || `Profile ${profileId}`;
  };

  const getInitials = (name = "") =>
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0].toUpperCase())
      .join("");

  const selectedProfile = profiles.find(
    (item) => Number(item.id) === Number(selectedUser)
  );

  const availableProfiles = profiles.filter(
    (item) =>
      profile &&
      Number(item.id) !== Number(profile.id) &&
      item.full_name?.toLowerCase().includes(
        search.toLowerCase()
      )
  );

  const chatMessages = messages
    .filter((item) => {
      if (!profile || !selectedUser) return false;

      const selectedId = Number(selectedUser);

      return (
        (Number(item.sender) === Number(profile.id) &&
          Number(item.receiver) === selectedId) ||
        (Number(item.sender) === selectedId &&
          Number(item.receiver) === Number(profile.id))
      );
    })
    .sort((a, b) => Number(a.id) - Number(b.id));

  const handleSendMessage = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!selectedUser) {
      setError("Please select a user.");
      return;
    }

    if (!content.trim()) {
      setError("Please enter a message.");
      return;
    }

    if (!profile) {
      setError("Profile not loaded.");
      return;
    }

    setSending(true);

    try {
      const token = localStorage.getItem("access_token");

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

      setMessages((previous) => [
        ...previous,
        response.data,
      ]);

      setContent("");
      setSuccess("Message sent successfully.");
    } catch (err) {
      console.error("Send message error:", err);

      if (err.response) {
        setError(
          "Unable to send message: " +
            JSON.stringify(err.response.data)
        );
      } else {
        setError("Unable to connect to the backend.");
      }
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="messages-loading">
        <div className="messages-spinner" />
        <p>Preparing your conversations...</p>
      </div>
    );
  }

  return (
    <div className="messages-page">
      <style>{`
        .messages-page {
          min-height: 100vh;
          padding: 35px 24px;
          background: #f4f7fc;
          color: #17233e;
          font-family: Inter, "Segoe UI", sans-serif;
        }

        .messages-wrapper {
          max-width: 1250px;
          margin: auto;
        }

        .messages-topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          margin-bottom: 30px;
        }

        .messages-brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .messages-brand-icon {
          width: 45px;
          height: 45px;
          display: grid;
          place-items: center;
          border-radius: 15px;
          color: white;
          font-size: 23px;
          background: linear-gradient(135deg, #3563ed, #6849df);
          box-shadow: 0 7px 18px #4565e633;
        }

        .messages-brand h2 {
          margin: 0;
          font-size: 22px;
          font-weight: 750;
          letter-spacing: -0.7px;
        }

        .messages-brand p {
          margin: 3px 0 0;
          color: #8490a6;
          font-size: 12px;
        }

        .messages-back {
          border: 1px solid #e1e7f1;
          background: white;
          color: #35435e;
          padding: 11px 17px;
          border-radius: 12px;
          font-weight: 600;
          transition: .2s;
        }

        .messages-back:hover {
          background: #edf2ff;
          border-color: #cdd9ff;
        }

        .messages-heading {
          margin-bottom: 23px;
        }

        .messages-heading h1 {
          font-size: clamp(25px, 3vw, 34px);
          font-weight: 800;
          letter-spacing: -1px;
          margin-bottom: 7px;
        }

        .messages-heading p {
          color: #8490a6;
          margin: 0;
          font-size: 14px;
        }

        .messages-workspace {
          display: grid;
          grid-template-columns: 310px minmax(0, 1fr);
          min-height: 620px;
          background: white;
          border: 1px solid #e7ebf4;
          border-radius: 22px;
          overflow: hidden;
          box-shadow: 0 12px 40px #233b6810;
        }

        .messages-contacts {
          border-right: 1px solid #e9edf5;
          background: #fff;
          min-width: 0;
        }

        .messages-contacts-header {
          padding: 24px 20px 17px;
          border-bottom: 1px solid #edf0f6;
        }

        .messages-contacts-title {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 17px;
        }

        .messages-contacts-title h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 750;
        }

        .messages-count {
          display: grid;
          place-items: center;
          min-width: 27px;
          height: 27px;
          padding: 0 7px;
          border-radius: 9px;
          background: #edf2ff;
          color: #4264e8;
          font-size: 12px;
          font-weight: 700;
        }

        .messages-search {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 0 12px;
          border: 1px solid #e7ebf3;
          border-radius: 12px;
          background: #f8faff;
        }

        .messages-search span {
          color: #8792a8;
          font-size: 19px;
        }

        .messages-search input {
          width: 100%;
          min-width: 0;
          border: 0;
          outline: 0;
          background: transparent;
          padding: 12px 0;
          font-size: 13px;
          color: #17233e;
        }

        .messages-contact-list {
          max-height: 520px;
          overflow-y: auto;
          padding: 9px;
        }

        .messages-contact {
          display: flex;
          align-items: center;
          gap: 11px;
          width: 100%;
          padding: 13px 11px;
          border: 0;
          border-radius: 14px;
          background: transparent;
          text-align: left;
          transition: .2s;
          margin-bottom: 4px;
        }

        .messages-contact:hover {
          background: #f5f7fd;
        }

        .messages-contact.active {
          background: #edf2ff;
          box-shadow: inset 3px 0 #4968ed;
        }

        .messages-avatar {
          display: grid;
          place-items: center;
          flex-shrink: 0;
          width: 43px;
          height: 43px;
          border-radius: 14px;
          color: #405ee3;
          background: linear-gradient(135deg, #e1eaff, #eee5ff);
          font-size: 13px;
          font-weight: 800;
        }

        .messages-contact-info {
          flex: 1;
          min-width: 0;
        }

        .messages-contact-name {
          display: block;
          color: #25324b;
          font-size: 13px;
          font-weight: 750;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }

        .messages-contact-role {
          display: block;
          margin-top: 4px;
          color: #8a95a9;
          font-size: 11px;
          text-transform: capitalize;
        }

        .messages-chat {
          display: flex;
          flex-direction: column;
          min-width: 0;
          min-height: 620px;
        }

        .messages-chat-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 19px 24px;
          border-bottom: 1px solid #edf0f6;
        }

        .messages-chat-person {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .messages-chat-person h3 {
          font-size: 15px;
          font-weight: 750;
          margin: 0 0 5px;
        }

        .messages-chat-person p {
          margin: 0;
          color: #8994a8;
          font-size: 12px;
          text-transform: capitalize;
        }

        .messages-online {
          display: inline-block;
          width: 7px;
          height: 7px;
          margin-right: 5px;
          border-radius: 50%;
          background: #27bf83;
        }

        .messages-chat-actions {
          display: flex;
          gap: 8px;
        }

        .messages-icon-btn {
          width: 37px;
          height: 37px;
          border: 1px solid #e8edf5;
          background: white;
          color: #65728b;
          border-radius: 11px;
          font-size: 17px;
        }

        .messages-chat-body {
          flex: 1;
          min-height: 350px;
          max-height: 460px;
          overflow-y: auto;
          padding: 26px;
          background:
            radial-gradient(#e9edf8 0.7px, transparent 0.7px);
          background-size: 18px 18px;
          background-color: #fbfcff;
        }

        .messages-date {
          text-align: center;
          margin-bottom: 24px;
        }

        .messages-date span {
          display: inline-block;
          padding: 7px 13px;
          border-radius: 20px;
          background: #edf1f8;
          color: #7b879d;
          font-size: 11px;
          font-weight: 650;
        }

        .messages-row {
          display: flex;
          margin-bottom: 19px;
        }

        .messages-row.sent {
          justify-content: flex-end;
        }

        .messages-bubble-wrap {
          max-width: min(75%, 430px);
        }

        .messages-bubble {
          padding: 13px 16px;
          border-radius: 17px;
          font-size: 13px;
          line-height: 1.65;
          overflow-wrap: anywhere;
          white-space: pre-wrap;
        }

        .messages-row.received .messages-bubble {
          border: 1px solid #e9edf5;
          border-top-left-radius: 5px;
          background: white;
          color: #39465e;
        }

        .messages-row.sent .messages-bubble {
          border-top-right-radius: 5px;
          background: linear-gradient(135deg, #4169ef, #604de0);
          color: white;
          box-shadow: 0 5px 13px #4b5ee31c;
        }

        .messages-sender {
          margin-bottom: 5px;
          color: #8994a8;
          font-size: 11px;
          font-weight: 700;
        }

        .messages-row.sent .messages-sender {
          text-align: right;
        }

        .messages-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          min-height: 330px;
          color: #8994a8;
        }

        .messages-empty-icon {
          display: grid;
          place-items: center;
          width: 66px;
          height: 66px;
          margin-bottom: 17px;
          border-radius: 22px;
          background: #edf2ff;
          color: #4d68e8;
          font-size: 29px;
        }

        .messages-empty h4 {
          color: #26344e;
          font-size: 16px;
          font-weight: 750;
        }

        .messages-empty p {
          font-size: 13px;
          max-width: 280px;
        }

        .messages-composer {
          padding: 17px 22px 21px;
          border-top: 1px solid #edf0f6;
          background: white;
        }

        .messages-composer form {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 7px 8px 7px 16px;
          border: 1px solid #e5eaf4;
          border-radius: 15px;
          background: #f8faff;
          transition: .2s;
        }

        .messages-composer form:focus-within {
          border-color: #aebeff;
          box-shadow: 0 0 0 3px #4568ef10;
        }

        .messages-composer input {
          flex: 1;
          width: 100%;
          min-width: 0;
          padding: 10px 0;
          border: 0;
          outline: 0;
          background: transparent;
          color: #26344e;
          font-size: 13px;
        }

        .messages-send {
          flex-shrink: 0;
          border: 0;
          border-radius: 11px;
          padding: 11px 17px;
          background: linear-gradient(135deg, #4169ef, #604de0);
          color: white;
          font-size: 12px;
          font-weight: 750;
          transition: .2s;
        }

        .messages-send:hover {
          filter: brightness(1.07);
          transform: translateY(-1px);
        }

        .messages-send:disabled {
          opacity: .6;
          cursor: not-allowed;
        }

        .messages-alert {
          padding: 12px 16px;
          margin-bottom: 15px;
          border-radius: 12px;
          font-size: 13px;
          overflow-wrap: anywhere;
        }

        .messages-alert.error {
          background: #fff0f0;
          color: #b42332;
          border: 1px solid #ffd9dc;
        }

        .messages-alert.success {
          background: #eafaf2;
          color: #147a50;
          border: 1px solid #c8f0dc;
        }

        .messages-loading {
          min-height: 70vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 14px;
          background: #f4f7fc;
          color: #7e8aa1;
        }

        .messages-spinner {
          width: 36px;
          height: 36px;
          border: 3px solid #dce5ff;
          border-top-color: #4169ef;
          border-radius: 50%;
          animation: messages-spin .8s linear infinite;
        }

        @keyframes messages-spin {
          to { transform: rotate(360deg); }
        }

        .messages-loading p {
          font-size: 13px;
        }

        @media (max-width: 760px) {
          .messages-page {
            padding: 22px 12px;
          }

          .messages-workspace {
            grid-template-columns: 1fr;
          }

          .messages-contacts {
            border-right: 0;
            border-bottom: 1px solid #e9edf5;
          }

          .messages-contact-list {
            display: flex;
            gap: 7px;
            max-height: 150px;
            overflow-x: auto;
          }

          .messages-contact {
            flex: 0 0 175px;
            align-self: flex-start;
          }

          .messages-chat {
            min-height: 510px;
          }

          .messages-chat-body {
            min-height: 300px;
            padding: 18px 13px;
          }

          .messages-chat-header {
            padding: 15px 13px;
          }

          .messages-chat-actions {
            display: none;
          }

          .messages-bubble-wrap {
            max-width: 88%;
          }

          .messages-composer {
            padding: 12px;
          }

          .messages-back {
            padding: 9px 11px;
            font-size: 12px;
          }
        }

        @media (max-width: 400px) {
          .messages-brand h2 {
            font-size: 18px;
          }

          .messages-brand p {
            font-size: 10px;
          }

          .messages-brand-icon {
            width: 38px;
            height: 38px;
          }

          .messages-back {
            font-size: 11px;
          }

          .messages-send {
            padding: 11px 12px;
          }
        }
      `}</style>

      <div className="messages-wrapper">
        <header className="messages-topbar">
          <div className="messages-brand">
            <div className="messages-brand-icon">
              ◈
            </div>

            <div>
              <h2>AlumniLoop</h2>
              <p>Your professional community</p>
            </div>
          </div>

          <button
            className="messages-back"
            onClick={() => navigate("/dashboard")}
          >
            ← Dashboard
          </button>
        </header>

        <div className="messages-heading">
          <h1>Your conversations</h1>
          <p>
            Build connections. Share opportunities. Grow together.
          </p>
        </div>

        {error && (
          <div className="messages-alert error">
            {error}
          </div>
        )}

        {success && (
          <div className="messages-alert success">
            {success}
          </div>
        )}

        <section className="messages-workspace">
          <aside className="messages-contacts">
            <div className="messages-contacts-header">
              <div className="messages-contacts-title">
                <h3>People</h3>
                <span className="messages-count">
                  {availableProfiles.length}
                </span>
              </div>

              <div className="messages-search">
                <span>⌕</span>
                <input
                  type="text"
                  placeholder="Search people..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="messages-contact-list">
              {availableProfiles.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  className={`messages-contact ${
                    Number(selectedUser) === Number(item.id)
                      ? "active"
                      : ""
                  }`}
                  onClick={() => {
                    setSelectedUser(String(item.id));
                    setError("");
                    setSuccess("");
                  }}
                >
                  <div className="messages-avatar">
                    {getInitials(item.full_name)}
                  </div>

                  <div className="messages-contact-info">
                    <span className="messages-contact-name">
                      {item.full_name}
                    </span>

                    <span className="messages-contact-role">
                      {item.role || "Member"}
                    </span>
                  </div>
                </button>
              ))}

              {availableProfiles.length === 0 && (
                <div className="text-center text-muted p-3 small">
                  No people found.
                </div>
              )}
            </div>
          </aside>

          <main className="messages-chat">
            <div className="messages-chat-header">
              {selectedProfile ? (
                <div className="messages-chat-person">
                  <div className="messages-avatar">
                    {getInitials(selectedProfile.full_name)}
                  </div>

                  <div>
                    <h3>{selectedProfile.full_name}</h3>
                    <p>{selectedProfile.role || "Member"}</p>
                  </div>
                </div>
              ) : (
                <div className="messages-chat-person">
                  <div className="messages-avatar">✉</div>
                  <div>
                    <h3>Messages</h3>
                    <p>Select someone to start a conversation</p>
                  </div>
                </div>
              )}

              <div className="messages-chat-actions">
                <button
                  type="button"
                  className="messages-icon-btn"
                  title="Back to dashboard"
                  onClick={() => navigate("/dashboard")}
                >
                  ↗
                </button>
              </div>
            </div>

            <div className="messages-chat-body">
              {!selectedUser ? (
                <div className="messages-empty">
                  <div className="messages-empty-icon">✉</div>
                  <h4>Every connection starts somewhere</h4>
                  <p>
                    Choose a student or alumni from the people list
                    to start a conversation.
                  </p>
                </div>
              ) : chatMessages.length === 0 ? (
                <div className="messages-empty">
                  <div className="messages-empty-icon">♡</div>
                  <h4>Say hello to {selectedProfile?.full_name}</h4>
                  <p>
                    Start a conversation and grow your professional
                    network.
                  </p>
                </div>
              ) : (
                <>
                  <div className="messages-date">
                    <span>Conversation</span>
                  </div>

                  {chatMessages.map((item) => {
                    const isSent =
                      Number(item.sender) === Number(profile?.id);

                    return (
                      <div
                        key={item.id}
                        className={`messages-row ${
                          isSent ? "sent" : "received"
                        }`}
                      >
                        <div className="messages-bubble-wrap">
                          <div className="messages-sender">
                            {isSent
                              ? "You"
                              : getProfileName(item.sender)}
                          </div>

                          <div className="messages-bubble">
                            {item.content}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>

            {selectedUser && (
              <div className="messages-composer">
                <form onSubmit={handleSendMessage}>
                  <input
                    type="text"
                    placeholder={`Message ${selectedProfile?.full_name || ""}...`}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    disabled={sending}
                    aria-label="Type your message"
                  />

                  <button
                    type="submit"
                    className="messages-send"
                    disabled={sending || !content.trim()}
                  >
                    {sending ? "Sending..." : "Send ➤"}
                  </button>
                </form>
              </div>
            )}
          </main>
        </section>
      </div>
    </div>
  );
}

export default Messages;

