import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

const SearchResults = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get("query");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    if (query) {
      setLoading(true); // Set loading to true before fetching
      fetch(`http://localhost:4000/search?query=${query}`)
        .then((res) => res.json())
        .then((data) => {
          setResults(data);
          setLoading(false); // Set loading to false after fetching
        })
        .catch((error) => {
          console.error("Error fetching search results:", error);
          setLoading(false); // Set loading to false on error
        });
    }
  }, [query]);

  return (
    <div>
      <h2>Search Results for: "{query}"</h2>
      {loading ? (
        <p>Loading...</p> // Display loading message
      ) : (
        <ul>
          {results.length > 0 ? (
            results.map((item) => <li key={item.id}>{item.title}</li>)
          ) : (
            <p>No results found.</p>
          )}
        </ul>
      )}
    </div>
  );
};

export default SearchResults;