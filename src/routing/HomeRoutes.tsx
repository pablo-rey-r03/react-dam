import type React from "react";
import { Route, Routes } from "react-router-dom";
import { Home } from "../components/Home";
import { Subs } from "../components/Subs";
import { DocManager } from "../components/DocManager";
import { CompanyDocs } from "../components/CompanyDocs";

export const HomeRoutes: React.FC = () => (
    <Routes>
        <Route path="dashboard" element={<Home />} />
        <Route path="companies" element={<Subs />} />
        <Route path="docs" element={<DocManager />} />
        <Route path="my_comp" element={<CompanyDocs />} />
    </Routes>
)