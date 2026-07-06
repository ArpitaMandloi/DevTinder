import React, { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { addUser } from "../utils/userSlice";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/constants";

const Login = () => {

const [emailId, setEmailId] = useState("");
const [password, setPassword] = useState("");
const dispatch = useDispatch();
const navigate = useNavigate();

const handleLogin = async () => {
  try {
    const res = await axios.post(
       BASE_URL + "/login",
      {
        emailId,
        password,
      },
      {
        withCredentials: true,
      }
    );

    
    dispatch(addUser(res.data));
    return navigate("/");
  } catch (err) {
    console.log(err.response?.data || err.message);
  }
};

  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="text-3xl font-bold text-center mb-6">Login</h2>

          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">Email</span>
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={emailId}
              onChange={(e) => setEmailId(e.target.value)}
              className="input input-bordered w-full"
            />
          </div>

          <div className="form-control mb-6">
            <label className="label">
              <span className="label-text">Password</span>
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input input-bordered w-full"
            />
          </div>

          <button onClick={handleLogin} className="btn btn-primary w-full">
            Login
          </button>

          <p className="text-center text-sm mt-4">
            Don't have an account?{" "}
            <span className="text-primary cursor-pointer hover:underline">
              Sign Up
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;