import React, { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import Editor from "../Editor";

export default function EditPost() {
  const { id } = useParams();
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [files, setFiles] = useState(null);
  const [tags, setTags] = useState(''); 
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:4000/post/${id}`)
      .then(response => response.json())
      .then(postInfo => {
        setTitle(postInfo.title);
        setContent(postInfo.content);
        setSummary(postInfo.summary);
        setTags(postInfo.tags ? postInfo.tags.join(',') : ''); 
      });
  }, [id]);

  async function updatePost(ev) {
    ev.preventDefault();
    const formData = new FormData();
    formData.set("title", title);
    formData.set("summary", summary);
    formData.set("content", content);
    formData.set("tags", tags);
    formData.set('id', id);
    if (files) {
      formData.append("file", files);
    }

    const response = await fetch(`http://localhost:4000/post/${id}`, {
      method: 'PUT',
      body: formData,
      credentials: 'include',
    });

    if (response.ok) {
      setRedirect(true);
    }
  }

  if (redirect) {
    return <Navigate to={'/post/' + id} />;
  }

  return (
    <form onSubmit={updatePost}>
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
        Update Post
      </button>
    </form>
  );
}