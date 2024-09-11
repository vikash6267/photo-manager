import logo from "./logo.svg";
import "./App.css";
import ImageUpload from "./pages/Home";
import LoginForm from "./pages/Login";
import OpenRoute from "./components/routes/OpenRoute";
import PrivateRoute from "./components/routes/PrivateRoute";
import { Route, Routes, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyProfile } from "./service/operations/user";
import { useEffect } from "react";
import useSocket from "./socket io/useSocket";
import LoginActivity from "./pages/LoginActivity";
import MainSidebar from "./components/dashboard/index";
import Chats from "./pages/Chats";
import MyFolder from "./pages/MyFolder";
import SingleFolder from "./pages/SingleFolder";

function App() {
  const { token } = useSelector((state) => state.auth);
  const { sessionID } = useSelector((state) => state.profile);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  useSocket();

  useEffect(() => {
    console.log(token);

    if (token) {
      dispatch(fetchMyProfile(token, navigate, sessionID));
    }
  }, [token]);
  return (
    <div className="App">
      <Routes>
        <Route
          path="/"
          element={
            <OpenRoute>
              <LoginForm />
            </OpenRoute>
          }
        />

        <Route
          element={
            <PrivateRoute>
              <MainSidebar />
            </PrivateRoute>
          }
        >
          <Route
            path="/login-activity"
            element={
              <PrivateRoute>
                <LoginActivity />
              </PrivateRoute>
            }
          />

          <Route
            path="/chats"
            element={
              <PrivateRoute>
                <Chats />
              </PrivateRoute>
            }
          />
          <Route
            path="/my-folder"
            element={
              <PrivateRoute>
                <MyFolder />
              </PrivateRoute>
            }
          />
          <Route
            path="/:folderName/:id"
            element={
              <PrivateRoute>
                <SingleFolder />
              </PrivateRoute>
            }
          />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
