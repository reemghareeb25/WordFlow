import { useEffect, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "./UserContext";

export default function Header() {
    const navigate = useNavigate();
    const { setUserInfo, userInfo } = useContext(UserContext);

    useEffect(() => {
        fetch('http://localhost:4000/profile', {
          credentials: 'include',
        }).then(response => {
          response.json().then(userInfo => {
            setUserInfo(userInfo);
          });
        });
      }, []);

    function logout() {
        fetch('http://localhost:4000/logout', {
          credentials: 'include',
          method: 'POST',
        });
        setUserInfo(null);
    }

    const username = userInfo?.username;

    return (
        <header>
            <Link to="/" className="logo">My Blog</Link>
            <nav>
                {username ? (
                    <>
                        <Link to="/create">Create new post</Link>
                        <button onClick={logout}>Logout ({username})</button>
                    </>
                ) : (
                    <>
                        <Link to="/login">Login</Link>
                        <Link to="/register">Register</Link>
                    </>
                )}
            </nav>
        </header>
    );
}
