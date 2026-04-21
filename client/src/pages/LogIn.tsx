import React, { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  console.log("Submit clicked");
  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
  e.preventDefault();

  try {
    const response = await fetch("http://localhost:5056/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    console.log("Login success:", data);
    localStorage.setItem("token", data.accessToken); 

  } catch (error: any) {
    alert(error.message); 
    console.error("Login error:", error.message);
  }
};

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white rounded-lg shadow-md w-[600px]">
        
        <div className="bg-[#76C893] text-center py-3 rounded-t-lg font-semibold">
          EduKos
        </div>

        <form onSubmit={handleSubmit} className="p-10">
          
          <div className="mb-4">
            <label className="block mb-1 text-sm">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-1/2 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="Enter your email"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1 text-sm">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-1/2 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="Enter your password"
            />
          </div>

          <div className="mt-6">
            <button
              type="submit"
              className="bg-green-400 px-4 py-2 rounded-md hover:bg-green-500 transition"
            >
              Log In
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}