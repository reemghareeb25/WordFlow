import { Link, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState, useRef } from "react";
import { UserContext } from "./UserContext";
import { debounce } from "lodash"; // Import debounce from lodash

export default function Header() {
  const { setUserInfo, userInfo } = useContext(UserContext);
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const [searchResults, setSearchResults] = useState([]); // State for search results
  const navigate = useNavigate();
  const [searchDone, setSearchDone] = useState(false);
  const searchContainerRef = useRef(null); // Ref for the search container

  useEffect(() => {
    fetch("http://localhost:4000/profile", {
      method: "GET",
      credentials: "include",
    }).then((response) => {
      response.json().then((userInfo) => {
        setUserInfo(userInfo);
      });
    });
  }, []);

  useEffect(() => {
    if (searchDone) {
      navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
      setSearchDone(false);
      setSearchQuery("");
      setSearchResults([]);
    }
  }, [searchDone, navigate, searchQuery]);

  // Clear search results when clicking outside the search bar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setSearchResults([]); // Clear search results
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function logout() {
    fetch("http://localhost:4000/logout", {
      credentials: "include",
      method: "POST",
    });
    setUserInfo(null);
  }

  const username = userInfo?.username;

  const debouncedSearch = debounce(async (query) => {
    if (query.trim() !== "") {
      try {
        const response = await fetch(
          `http://localhost:4000/search?query=${encodeURIComponent(query)}`
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setSearchResults(data); // Store full post objects
      } catch (error) {
        console.error("Error during search:", error);
      }
    } else {
      setSearchResults([]);
    }
  }, 300);

  const handleInputChange = (ev) => {
    const query = ev.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

  const clearSearchResults = () => {
    setSearchResults([]);
    setSearchQuery("");
  };

  return (
    <header className="header">
      <Link to="/" className="logo">
        WordFlow
      </Link>

      <div className="search-bar" role="search" ref={searchContainerRef}>
        <div className="search-container">
        <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="search-icon" // Add a class for the icon
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
      />
    </svg>

          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={handleInputChange}
            className="search-input"
            aria-label="Search input"
          />
        </div>

        {searchResults.length > 0 && (
          <div className="search-results-dropdown">
            {searchResults.map((result) => (
              <div
                key={result._id} // Use post ID as the key
                className="search-result-item"
                onClick={() => {
                  navigate(`/post/${result._id}`); // Navigate to the full post
                  clearSearchResults(); // Clear search results
                }}
              >
                <h3>{result.title}</h3>
                <p>{result.summary}</p>
                <p>By: {result.author.username}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <nav className="nav">
        {username ? (
          <>
            <Link to="/create" className="write-btn">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                />
              </svg>
              Write
            </Link>
            <button onClick={logout} className="logout-btn">
              Logout ({username})
            </button>
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