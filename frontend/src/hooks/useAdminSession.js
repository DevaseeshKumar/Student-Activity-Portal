// src/hooks/useAdminSession.js
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axiosInstance";

export const useAdminSession = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      try {
        axios.get("http://localhost:8080/api/admin/me", { withCredentials: true })
;
      } catch (err) {
        navigate("/admin/login");
      }
    };

    checkSession();
  }, [navigate]);
};
