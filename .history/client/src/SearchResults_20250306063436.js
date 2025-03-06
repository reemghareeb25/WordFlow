import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const SearchResults = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get("query");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (query) {
      setLoading(true);
      fetch(`http://localhost:4000/search?query=${query}`)
        .then((res) => res.json())
        .then((data) => {
          setResults(data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching search results:", error);
          setLoading(false);
        });
    }
  }, [query]);

  return (
    <div>
      <h2>Search Results for: "{query}"</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {results.length > 0 ? (
            results.map((post) => (
              <li key={post._id}>
                <h3>{post.title}</h3>
                <p>{post.summary}</p>
                <p>By: {post.author.username}</p>
                <Link to={`/post/${post._id}`}>Read more</Link>
              </li>
            ))
          ) : (
            <p>No results found.</p>
          )}
        </ul>
      )}
    </div>
  );
};

export default SearchResults;