import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "../components/layout/Layout";
import Home from "../pages/Home";
import SentenceTag from "../pages/SentenceTag";

const MyRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/:id" element={<SentenceTag />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default MyRoutes;
