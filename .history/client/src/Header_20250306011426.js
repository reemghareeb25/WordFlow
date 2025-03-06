import { Link } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "./UserContext";
import { Pencil } from "lucide-react"; // Using Lucide React for the "Write" icon

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
    <header className="flex justify-between items-center p-4">
      <Link to="/" className="text-2xl font-bold logo">
        WordFlow
      </Link>
      <nav className="flex items-center gap-4">
        {username && (
          <>
            <Link
              to="/create"
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              <Pencil size={20} />
              <span>Write</span>
            </Link>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              Logout ({username})
            </button>
          </>
        )}
        {!username && (
          <>
            <Link to="/login" className="px-4 py-2 text-blue-500 hover:underline">
              Login
            </Link>
            <Link to="/register" className="px-4 py-2 text-blue-500 hover:underline">
              Register
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
