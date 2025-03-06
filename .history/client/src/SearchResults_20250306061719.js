import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

const SearchResults = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get("query");
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (query) {
      fetch(`http://localhost:4000/search?query=${query}`)
        .then((res) => res.json())
        .then((data) => setResults(data));
    }
  }, [query]);

  return (
    <div>
      <h2>Search Results for: "{query}"</h2>
      <ul>
        {results.length > 0 ? (
          results.map((item) => <li key={item.id}>{item.title}</li>)
        ) : (
          <p>No results found.</p>
        )}
      </ul>
    </div>
  );
};

export default SearchResults;
