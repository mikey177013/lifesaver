import { useState, useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import MapView from "./pages/MapView";
import ChatBot from "./pages/ChatBot";
import MedicalCard from "./pages/MedicalCard";
import EmergencyContacts from "./pages/EmergencyContacts";
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/map" element={<MapView />} />
          <Route path="/chat" element={<ChatBot />} />
          <Route path="/medical" element={<MedicalCard />} />
          <Route path="/contacts" element={<EmergencyContacts />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-center" richColors />
    </div>
  );
}

export default App;