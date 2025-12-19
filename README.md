# WordFlow

This is a full-stack blogging platform that allows users to register, log in, create, edit, delete, and search for blog posts. The backend is built with **Node.js, Express.js, MongoDB**, and **Mongoose**, while the frontend is developed using **React.js**.

## Features
- User authentication (register, login, logout) with **JWT**
- Secure password hashing using **bcrypt**
- CRUD operations for blog posts (create, update, delete, search)
- Image upload functionality using **Multer**
- Search functionality for blog posts by title, content, author, and tags
- Protected routes requiring authentication

---

## Tech Stack

### Backend
- **Node.js** & **Express.js** - Backend framework
- **MongoDB** & **Mongoose** - Database
- **JWT (JSON Web Tokens)** - Authentication
- **bcrypt** - Password hashing
- **Multer** - File uploads
- **CORS** - Handling cross-origin requests

### Frontend
- **React.js** - UI framework
---

## Installation & Setup

### Prerequisites
Ensure you have the following installed:
- **Node.js** & **Yarn**
- **MongoDB** (running locally or using a cloud service like MongoDB Atlas)

### 1. Clone the Repository
```sh
git clone git@github.com:reemghareeb25/WordFlow.git
cd WordFlow
```

### 2. Install Dependencies
```sh
cd client && yarn install
cd ../server && yarn install
```

### 3. Set Up Environment Variables
Create a `.env` file in the **server** directory and add the following:
```
JWT_SECRET=kfldkscmlsdcmkwklkekksnfuckthat
MONGODB_URI=mongodb+srv://blog:bloggy15@cluster0.gem8r.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
PORT=4000
```

### 4. Start the Project
Run both the backend and frontend with **one command**:
```sh
yarn start
```
This will start:
- **Frontend** (`client/`) at `http://localhost:3000`
- **Backend** (`server/`) at `http://localhost:4000`

If you want to start them separately:
```sh
nodemon server  # Start backend only
yarn client  # Start frontend only
```

---

## API Routes

### **Authentication**
| Route         | Method | Description |
|--------------|--------|-------------|
| `/register`  | POST   | Register a new user |
| `/login`     | POST   | Login and get JWT token |
| `/profile`   | GET    | Get logged-in user profile |
| `/logout`    | POST   | Logout user |

### **Posts**
| Route           | Method | Description |
|----------------|--------|-------------|
| `/post`        | GET    | Get all posts |
| `/post/:id`    | GET    | Get a single post by ID |
| `/post`        | POST   | Create a new post (requires authentication) |
| `/post/:id`    | PUT    | Update a post (requires authentication) |
| `/post/:id`    | DELETE | Delete a post (requires authentication) |
| `/search?query=text` | GET | Search posts by keyword |

---

### Future Improvements
- Implement pagination for blog posts
- Improve UI/UX with better styling
- Add comments & likes functionality
- Improve security measures

---



