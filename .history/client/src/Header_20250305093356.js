import { useEffect, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "./UserContext";

export default function Header() {
    const navigate = useNavigate();
    const { setUserInfo, userInfo } = useContext(UserContext);

    useEffect(() => {
        fetch('http://localhost:4000/profile', { credentials: 'include' })
            .then(res => res.ok ? res.json() : Promise.reject('Failed to fetch profile'))
            .then(setUserInfo)
            .catch(console.error);
    }, []);

    async function logout() {
        try {
            const res = await fetch('http://localhost:4000/logout', {
                method: 'POST',
                credentials: 'include',
            });
            if (res.ok) {
                setUserInfo(null);
                navigate('/');
                alert('Logged out successfully');
            }
        } catch (err) {
            console.error(err);
            alert('Logout failed');
        }
    }

    const username = userInfo?.username;

    return (
        <header className="header">
            <Link to="/" className="logo">My Blog</Link>
            <nav>
                {username ? (
                    <>
                        <Link to="/create">Write</Link>
                        <button onClick={logout} className="logout-btn">Logout</button>
                    </>
                ) : (
                    <>
                        <Link to="/login">Sign in</Link>
                        <Link to="/register" className="get-started-btn">Get started</Link>
                    </>
                )}
            </nav>
        </header>
    );
}
