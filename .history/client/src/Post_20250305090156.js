import { useEffect, useState, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { formatISO9075 } from "date-fns";
import { UserContext } from "./UserContext";

export default function PostPage() {
    const [postInfo, setPostInfo] = useState(null);
    const { userInfo } = useContext(UserContext);
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        fetch(`http://localhost:4000/post/${id}`)
            .then(response => response.json())
            .then(postInfo => {
                console.log("Fetched post info:", postInfo);
                setPostInfo(postInfo);
            });
    }, [id]);

    async function deletePost() {
        const confirmDelete = window.confirm("Are you sure you want to delete this post?");
        if (!confirmDelete) return;

        const response = await fetch(`http://localhost:4000/post/${id}`, {
            method: "DELETE",
            credentials: "include",
        });

        if (response.ok) {
            navigate("/");
        }
    }

    if (!postInfo) return '';

    return (
        <div className="post-page">
            <h1>{postInfo.title}</h1>
            <time>{formatISO9075(new Date(postInfo.createdAt))}</time>
            <div className="author">by @{postInfo.author?.username}</div>

            {userInfo?.id === postInfo.author?._id && (
                <div className="edit-row">
                    <Link className="edit-button" to={`/edit/${postInfo._id}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                        </svg>
                        Edit this post
                    </Link>
                    
                    <button className="delete-button" onClick={deletePost}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                        Delete
                    </button>
                </div>
            )}

            <div className="image">
                <img src={`http://localhost:4000/${postInfo.cover}`} alt={postInfo.title} />
            </div>
            <div dangerouslySetInnerHTML={{ __html: postInfo.content }} />
        </div>
    );
}