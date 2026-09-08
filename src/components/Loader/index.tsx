import React from "react";
import CircularProgress from "@mui/material/CircularProgress";
import "./LoaderStyle.css";

export const Loader: React.FC = () => (
  <div className="page-loader">
    <CircularProgress
      className="page-loader__spinner"
      size={50}
      thickness={4}
    />
    <p className="page-loader__text">Carregando...</p>
  </div>
);

export default Loader;
