import React, { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import { Routes, Route } from "react-router-dom";
import Add from "./pages/Add";
import List from "./pages/List";
import Orders from "./pages/Orders";
import Login from "./components/Login";
import { ToastContainer } from 'react-toastify';
import Suggestedreview from "./pages/Suggestedreview";
import 'react-toastify/dist/ReactToastify.css';
import UpdateProduct from "./pages/UpdateProduct";
import AddPrompts from "./pages/AddPrompts";

export const backendUrl = import.meta.env.VITE_BACKEND_URL;
export const currency = '₹';

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token') ? localStorage.getItem('token') : "");

  // to prevent page refresh logout
  useEffect(() => {
    localStorage.setItem('token', token)
  }, [token])

  return (
    <div className="bg-gray-50 min-h-screen">
      <ToastContainer />
      {token === "" ? (
        <Login setToken={setToken} />
      ) : (
        <>
          <Navbar setToken={setToken} />
          <hr />
          <div className="flex w-full">
            <Sidebar />
            <div className="w-[70%] mx-auto ml-[max(5vw,25px)] my-8 text-gray-600 text-base">
              <Routes>
                <Route path="/add" element={<Add token={token} />} />
                <Route path="/list" element={<List token={token} />} />
                <Route path="/orders" element={<Orders token={token} />} />
                <Route path="/suggestedreview" element={<Suggestedreview token={token}/>}/>
                <Route path="/updateProduct/:id" element={<UpdateProduct token={token} />} />
                <Route path="/addPrompts" element={<AddPrompts token={token}/>}/>
              </Routes>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default App;
