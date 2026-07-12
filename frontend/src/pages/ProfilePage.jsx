import { useEffect, useState } from "react";
import rollerSkate from "../images/rollerskate.png";

const EVENT_GOAL = 10;
export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [photo, setPhoto] = useState("");
  const [friendUsername, setFriendUsername] = useState("");
  const [message, setMessage] = useState("");

  async function loadProfile() {
    try {
      const response = await fetch("http://localhost:3000/api/me", { credentials: "include" });
      if (!response.ok) throw new Error();
      const data = await response.json();
      setProfile(data);
      setPhoto(localStorage.getItem(`rollcallProfilePhoto:${data.user.id}`) || "");
    } catch {
      setMessage("Could not load your profile. Log out and log in again.");
    }
  }

  useEffect(() => { loadProfile(); }, []);

  function handlePhoto(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return setMessage("Please choose an image file.");
    if (file.size > 2 * 1024 * 1024) return setMessage("Please choose an image smaller than 2 MB.");
    const reader = new FileReader();
    reader.onload = () => {
      const image = String(reader.result);
      localStorage.setItem(`rollcallProfilePhoto:${profile.user.id}`, image);
      setPhoto(image);
      setMessage("Profile photo updated.");
    };
    reader.readAsDataURL(file);
  }

  async function addFriend(event) {
    event.preventDefault();
    const response = await fetch("http://localhost:3000/api/friends", {
      method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
      body: JSON.stringify({ username: friendUsername }),
    });
    const result = await response.json();
    if (!response.ok) return setMessage(result.message);
    setFriendUsername("");
    setMessage(`${result.friend.username} added as a friend.`);
    await loadProfile();
  }

  async function removeFriend(friend) {
    await fetch(`http://localhost:3000/api/friends/${friend.id}`, { method: "DELETE", credentials: "include" });
    setMessage(`${friend.username} removed.`);
    await loadProfile();
  }

  if (!profile) return <main className="profile-page"><h1>Profile</h1><p>{message || "Loading..."}</p></main>;

  const { user, friends, attendedEventIds } = profile;
  const attendedCount = attendedEventIds.length;
  const progress = Math.min(100, Math.round((attendedCount / EVENT_GOAL) * 100));

  return (
    <main className="profile-page">
      <h1>Your Profile</h1>
      {message && <p className="profile-message" role="status">{message}</p>}
      <section className="profile-card profile-summary">
        <div>
          {photo ? <img className="profile-photo" src={photo} alt={`${user.username}'s profile`} /> :
            <div className="profile-photo profile-placeholder">{user.username.charAt(0).toUpperCase()}</div>}
          <label className="photo-upload">Upload photo<input type="file" accept="image/*" onChange={handlePhoto} /></label>
        </div>
        <div className="account-details">
          <h2>{user.firstName || user.username} {user.lastName || ""}</h2>
          <p><strong>Username:</strong> {user.username}</p><p><strong>Email:</strong> {user.email}</p>
          <p><strong>Location:</strong> {user.location || "Not provided"}</p><p><strong>Age:</strong> {user.age || "Not provided"}</p>
          <p><strong>Skating level:</strong> {user.skateLevel || "Not provided"}</p>
        </div>
      </section>
      <section className="profile-card">
        <h2>Event progress</h2><p>{attendedCount} of {EVENT_GOAL} events completed</p>
        <div className="progress-track" role="progressbar" aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
          <span className="progress-percent">{progress}%</span>
          <img
            className="progress-skate"
            src={rollerSkate}
            alt=""
            style={{ left: `clamp(0px, calc(${progress}% - 24px), calc(100% - 48px))` }}
          />
        </div>
        <p>Mark events as attended from the Events page to increase your progress.</p>
      </section>
      <section className="profile-card">
        <h2>Friends</h2>
        <form className="friend-form" onSubmit={addFriend}>
          <label htmlFor="friend-username">Add by exact username</label>
          <input id="friend-username" value={friendUsername} onChange={(event) => setFriendUsername(event.target.value)} required />
          <button type="submit">Add friend</button>
        </form>
        {friends.length === 0 ? <p>No friends added yet.</p> : <ul className="friend-list">{friends.map((friend) =>
          <li key={friend.id}><span>{friend.username}</span><button type="button" onClick={() => removeFriend(friend)}>Remove</button></li>)}</ul>}
      </section>
    </main>
  );
}
