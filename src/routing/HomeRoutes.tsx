import type React from "react";
import { Route, Routes } from "react-router-dom";
import { Home } from "../components/Home";
import { Subs } from "../components/Subs";
import { DocuForm } from "../components/DocForm";

export const HomeRoutes: React.FC = () => (
    <Routes>
        <Route path="dashboard" element={<Home />} />
        <Route path="companies" element={<Subs />} />
        <Route path="formDoc" element={<DocuForm />} />
        <Route path="formDoc/:id" element={<DocuForm />} />
        {/* <Route path="reports" element={<Reports />} />
        <Route path="profile" element={<Profile />} /> */}
        <Route path="*" element={<Home />} /> {/* default */}
    </Routes>
)