import { useState } from "react";
import { Link } from "react-router-dom";

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(true); 

  async function register(ev) {
    ev.preventDefault();
    const response = await fetch('http://localhost:4000/register', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
      headers: { 'Content-Type': 'application/json' },
    });
    if (response.status === 200) {
      alert('registration successful');
    } else {
      alert('registration failed');
    }
  }

  return (
    <form className="register" onSubmit={register}>
      <h1>{isRegister ? 'Register' : 'Login'}</h1>
      <input
        type="text"
        placeholder="username"
        value={username}
        onChange={ev => setUsername(ev.target.value)}
      />
      <input
        type="password"
        placeholder="password"
        value={password}
        onChange={ev => setPassword(ev.target.value)}
      />
      <button>{isRegister ? 'Register' : 'Login'}</button>
      <p>
        {isRegister ? "Already have an account? " : "Don't have an account? "}
        <Link to={isRegister ? "/login" : "/register"} onClick={() => setIsRegister(!isRegister)}>
          {isRegister ? 'Login' : 'Register'}
        </Link>
      </p>
    </form>
  );
}