
import { Route, Routes } from "react-router-dom";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";


const App = () => {
  return (
    <>

      {/* Routes */}
      <Routes>
        <Route path="/" element={<Register/>} />
         <Route path="/register" element={<Register/>} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </>
  );
};

export default App;
