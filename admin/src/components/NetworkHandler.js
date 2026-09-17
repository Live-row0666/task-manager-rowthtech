import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const NetworkHandler = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    const defaultTitle = "Task Manager";
    const isAdminRoute = location.pathname.startsWith("/admin");

    document.title = isAdminRoute ? `${defaultTitle} | Admin` : defaultTitle;
  }, [location.pathname]);

  useEffect(() => {
    if (!isOnline) {
      if (location.pathname !== "/no-internet") {
        localStorage.setItem("lastOnlineRoute", location.pathname);
      }
      navigate("/no-internet", { replace: true });
    }
  }, [isOnline, navigate, location]);

  return children;
};

export default NetworkHandler;