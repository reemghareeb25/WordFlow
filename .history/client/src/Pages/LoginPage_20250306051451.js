import { useState } from "react";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white shadow-xl rounded-lg">
        <h2 className="text-center text-2xl font-bold text-gray-700">
          {isLogin ? "Login to Your Account" : "Create an Account"}
        </h2>
        <form className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-600">Name</label>
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="John Doe"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-600">Email</label>
            <input
              type="email"
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="example@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Password</label>
            <input
              type="password"
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="********"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 text-white bg-indigo-500 rounded-lg hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
          >
            {isLogin ? "Login" : "Register"}
          </button>
        </form>
        <p className="text-sm text-center text-gray-600">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span
            className="text-indigo-500 cursor-pointer hover:underline"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "Sign up" : "Log in"}
          </span>
        </p>
      </div>
    </div>
  );
}