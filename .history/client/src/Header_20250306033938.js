import { Link, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "./UserContext";
import { debounce } from "lodash"; // Import debounce from lodash

export default function Header() {
  const { setUserInfo, userInfo } = useContext(UserContext);
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const [searchResults, setSearchResults] = useState([]); // State for search results
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:4000/profile", {
        method: 'GET',
      credentials: 'include',
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

  // Debounced search function
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
        setSearchResults(data); // Set search results
      } catch (error) {
        console.error("Error during search:", error);
        // Optionally, show an error message to the user
      }
    } else {
      setSearchResults([]); // Clear results if query is empty
    }
  }, 300); // 300ms delay

  // Handle input change
  const handleInputChange = (ev) => {
    const query = ev.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

  // Handle search form submission
  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (searchQuery.trim() !== "") {
      navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      setSearchResults([]); // Clear results after navigation
    }
  };

  // Clear search results
  const clearSearchResults = () => {
    setSearchResults([]);
  };

  return (
    <header className="header">
      <Link to="/" className="logo">
        WordFlow
      </Link>

      {/* Updated Search Bar */}
      <form className="search-bar" onSubmit={handleSearchSubmit} role="search">
        <div className="search-container">
          <button type="submit" className="search-icon-button" aria-label="Search">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="search-icon"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
          </button>
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={handleInputChange}
            className="search-input"
            aria-label="Search input"
          />
        </div>

        {/* Search Results Dropdown */}
        {searchResults.length > 0 && (
          <div className="search-results-dropdown">
            {searchResults.map((result, index) => (
              <div
                key={index}
                className="search-result-item"
                onClick={() => {
                  navigate(`/post/${result.id}`); // Navigate to the result's page
                  clearSearchResults(); // Clear results after selection
                }}
              >
                {result.title} {/* Adjust based on your data structure */}
              </div>
            ))}
          </div>
        )}
      </form>

      <nav className="nav">
        {username && (
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