import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Post from "../Post";

export default function IndexPage() {
    const [posts, setPosts] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("authToken");
        if (!token) {
            navigate('/login'); // redirect to login if no token
        }
    }, []);

    useEffect(() => {
        const url = searchQuery 
            ? `http://localhost:4000/search?query=${encodeURIComponent(searchQuery)}`
            : 'http://localhost:4000/post';

        fetch(url).then(response => {
            response.json().then(posts => {
                setPosts(posts);
            });
        });
    }, [searchQuery]);

    return (
        <>
            <section className="hero">
                <h1>Human stories & ideas</h1>
                <p>A place to read, write, and deepen your understanding</p>
                <button className="start-reading-btn">Start reading</button>
            </section>

            <section className="search-bar">
                <input 
                    type="text" 
                    placeholder="🔍 Search posts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </section>

            <section className="posts">
                {posts.length > 0 ? (
                    posts.map(post => <Post key={post._id} {...post} />)
                ) : (
                    <p>No posts found</p>
                )}
            </section>
        </>
    );
}
