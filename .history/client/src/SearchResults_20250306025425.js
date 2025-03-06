import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export default function SearchResults() {
  const [posts, setPosts] = useState([]);
  const location = useLocation();
  const query = new URLSearchParams(location.search).get("query");

  useEffect(() => {
    if (query) {
      fetch(`http://localhost:4000/search?query=${encodeURIComponent(query)}`)
        .then((response) => response.json())
        .then((data) => {
          setPosts(data);
        })
        .catch((error) => {
          console.error("Error fetching search results:", error);
        });
    }
  }, [query]);

  return (
    <div className="search-results">
      <h2>Search Results for "{query}"</h2>
      {posts.length > 0 ? (
        posts.map((post) => (
          <div key={post._id} className="post">
            <h3>{post.title}</h3>
            <p>{post.summary}</p>
            <p>By: {post.author.username}</p>
          </div>
        ))
      ) : (
        <p>No results found.</p>
      )}
    </div>
  );
}