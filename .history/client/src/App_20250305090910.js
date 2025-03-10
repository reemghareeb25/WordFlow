import './App.css';
import Header from './Header';
import Layout from './Layout';
import IndexPage from './Pages/IndexPage';
import LoginPage from './Pages/LoginPage';
import RegisterPage from './Pages/RegisterPage';
import CreatePost from './Pages/CreatePost';
import PostPage from './Pages/PostPage';
import EditPost from "./Pages/EditPost";
import { Route, Routes } from 'react-router-dom';
import { UserContextProvider } from './UserContext';

function App() {
    return (
        <UserContextProvider>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<IndexPage />} />
                    <Route path="login" element={<LoginPage />} />
                    <Route path="register" element={<RegisterPage />} />
                    <Route path="create" element={<CreatePost />} />
                    <Route path="edit/:id" element={<EditPost />} />
                    <Route path="post/:id" element={<PostPage />} />
                </Route>
            </Routes>
        </UserContextProvider>
    );
}

export default App;
