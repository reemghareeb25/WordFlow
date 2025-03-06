import React, { useState } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { Navigate } from "react-router-dom";
import Editor from "../Editor";

export default function CreatePost(){
    const [title, setTitle] = useState('');
    const [summary, setSummary] = useState('');
    const [content, setContent] = useState('');
    const [files, setFiles] = useState(null);
    const [tags, setTags] = useState(''); // New state for tags
    const [redirect, setRedirect] = useState(false);

    async function createNewPost(ev) {
        ev.preventDefault();
        const formData = new FormData();
        formData.set("title", title);
        formData.set("summary", summary);
        formData.set("content", content);
        formData.set("tags", tags); // Include tags
        if (files) {
            formData.append("file", files);
        }
        const response = await fetch('http://localhost:4000/post', {
            method: 'POST',
            body: formData,
            credentials: 'include',
        })
        if(response.ok){
            setRedirect(true);
        }
    }
    if (redirect) {
        return <Navigate to={'/'} />;
    }
    return(
        <form onSubmit={createNewPost}>
            <input 
                type="text" 
                placeholder="Title" 
                value={title} 
                onChange={(ev) => setTitle(ev.target.value)} 
            />
            <input 
                type="text" 
                placeholder="Summary" 
                value={summary} 
                onChange={(ev) => setSummary(ev.target.value)} 
            />
            <input 
                type="text" 
                placeholder="Tags (comma-separated)" 
                value={tags} 
                onChange={(ev) => setTags(ev.target.value)} 
            />
            <input 
                type="file" 
                onChange={(ev) => setFiles(ev.target.files[0])} 
            />
            <Editor value={content} onChange={setContent} />
            <button style={{ marginTop: "5px" }} type="submit">
                Create Post
            </button>
        </form>
    );
}
