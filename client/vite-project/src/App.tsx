/**
 * Project: Exclusive Drop Frontend
 * Developer: Ilya Zeldner
 */
import { useState, useEffect, Component } from 'react'
import Login from './components/authintication/login'
import Register from './components/authintication/register'
import StarterPage from './pages/starterPage'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ChooseProfile from './components/profile/chooseProfile'
import axios, { AxiosError } from "axios";
const API_BASE = "/api";
import Layout from './components/NavigationAndSwitcher/Layout';
import Navigationbar from './components/NavigationAndSwitcher/NavigationBar';
import ForgotPassword from './components/authintication/forgotPass';
import AddProfile from './components/profile/addprofile';
import ParentPage from './components/mainPage/parentPage';
import MainPage from './components/mainPage/mainPage';
import Vocabulary from './components/vocabulary/vocabularyHome';
import TranslateGame from './components/vocabulary/translate';
import ChatBot from './components/mainPage/chatbot';


function App() {
  return (

    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StarterPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/chooseProfile" element={<ChooseProfile />} />
        <Route path="/addprofile" element={<AddProfile />} />
        <Route path="/forgotPassword" element={<ForgotPassword />}/>
        <Route path="/parentPage" element={<ParentPage/>}/>
        <Route path="/vocabulary/index" element={<Vocabulary/>}/>
        <Route path="/vocabulary/translate" element={<TranslateGame />} />
        <Route path="chatbot" element={<ChatBot />} />
        <Route path="/mainPage" element={<MainPage/>}/>
      </Routes> 
     
    </BrowserRouter>
    
  );
}

export default App;