import { formatISO9075 } from "date-fns";
import { Link } from "react-router-dom";

export default function Post({ _id, title, summary, cover, content, createdAt, author }) {
  return (
    <div className="post">
      <div className="image">
        <Link to={`/post/${_id}`}>
          <img src={'http://localhost:4000/' + cover} alt="" />
        </Link>
      </div>
      <div className="texts">
        <p className="author">{author.username}</p>
        <Link to={`/post/${_id}`} className="title-link">
          <h2>{title}</h2>
        </Link>
        <p className="summary">{summary}</p>
        <div className="metadata">
          <time>{formatISO9075(new Date(createdAt))}</time>
          <span>•</span>
          <span>43K views</span> {/* Replace with dynamic data if available */}
          <span>•</span>
        
        </div>
      </div>
    </div>
  );
}