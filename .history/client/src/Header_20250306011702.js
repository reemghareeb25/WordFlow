import { Link } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "./UserContext";
import { Pencil } from "lucide-react"; // Import the Pencil icon

export default function Header() {
  const { setUserInfo, userInfo } = useContext(UserContext);

  useEffect(() => {
    fetch("http://localhost:4000/profile", {
      credentials: "include",
    }).then((response) => {
      response.json().then((userInfo) => {
        setUserInfo(userInfo);
      });
    });
  }, []);

  function logout() {
    fetch("http://localhost:4000/logout", {
      credentials: "include",
      method: "POST",
    });
    setUserInfo(null);
  }

  const username = userInfo?.username;

  return (
    <header className="header">
      <Link to="/" className="logo">
        WordFlow
      </Link>
      <nav className="nav">
        {username && (
          <>
            <Link to="/create" className="write-btn">
              <Pencil size={20} />
              Write
            </Link>
            <button onClick={logout} className="logout-btn">
              Logout ({username})
            </button>
          </>
        )}
        {!username && (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </nav>
    </header>
  );
}
