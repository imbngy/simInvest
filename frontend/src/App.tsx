import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/Notfound";
import Navbar from "./components/Navbar";
import PrivateRoute from "./routes/PrivateRoute";
import Landing from "./pages/Landing";
import AccountDetails from "./pages/AccountDetails";
import InvestmentDetails from "./pages/InvestmentDetails";
import CreateAccount from "./pages/CreateAccount";
import CreateInvestment from "./pages/CreateInvestment";


export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/landing" element={<Landing />} />
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route path="/account/:id" element={<AccountDetails />} />
        <Route path="/investment/:id" element={<InvestmentDetails />} />
        <Route path="/create/account" element={<CreateAccount />} />
        <Route path="/investments/new" element={<CreateInvestment />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
