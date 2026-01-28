import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Parcelles from "./pages/Parcelles";
import CapteursIoT from "./pages/CapteursIoT";
import GestionDrones from "./pages/GestionDrones";
import ImagesSatellites from "./pages/ImagesSatellites";
import AnalyseImagesIA from "./pages/AnalyseImagesIA";
import IrrigationAuto from "./pages/IrrigationAuto";
import RecommandationsIA from "./pages/RecommandationsIA";
import Marketplace from "./pages/Marketplace";
import Analytics from "./pages/Analytics";
import Alertes from "./pages/Alertes";
import Parametres from "./pages/Parametres";
import { Toaster } from "./components/ui/sonner";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="parcelles" element={<Parcelles />} />
            <Route path="capteurs" element={<CapteursIoT />} />
            <Route path="drones" element={<GestionDrones />} />
            <Route path="satellites" element={<ImagesSatellites />} />
            <Route path="analyse-ia" element={<AnalyseImagesIA />} />
            <Route path="irrigation" element={<IrrigationAuto />} />
            <Route path="recommandations" element={<RecommandationsIA />} />
            <Route path="marketplace" element={<Marketplace />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="alertes" element={<Alertes />} />
            <Route path="parametres" element={<Parametres />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </>
  );
}

export default App;
