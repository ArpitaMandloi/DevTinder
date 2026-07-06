import { useEffect, useState } from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";

import Navbar from "./Navbar";
import DynamicBackground from "./DynamicBackground";
import Footer from "./Footer";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { addUser } from "../utils/userSlice";

const Body = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const dispatch = useDispatch();
  const Navigate = useNavigate();
  const userData = useSelector((store) => store.user);
  
  const fetchUser = async () => {
    if(userData) return;
    try{
     const res = await axios.get(BASE_URL + "/profile/view",{
      withCredentials:true,
     });
     dispatch(addUser(res.data));
  }catch(err){
    if(err.status === 401){
      Navigate("/login");
    }
    console.log(err);
  }
  };

  useEffect(() => {
    if(!userData){
      fetchUser();
    }
  },[]);

  return (
    <div className="min-h-screen flex flex-col relative">
      <DynamicBackground isDarkMode={isDarkMode} />

      <Navbar
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
      />

      <main className="flex-1 pt-24 px-8 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>

      <Footer isDarkMode={isDarkMode} />
    </div>
  );
};

export default Body;