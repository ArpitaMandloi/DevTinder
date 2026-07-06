import { BrowserRouter, Routes, Route } from "react-router-dom";
import Body from "./components/Body";
import Login from "./components/Login";
import Profile from "./components/Profile";
import {Provider} from "react-redux";
import appStore from "./utils/appStore";

const Home = () => {
  return (
    <h2 className="text-4xl font-bold mt-10">
      Welcome to DevTinder
    </h2>
  );
};

function App() {
  return (
   <>
     <Provider store = {appStore}>
        <BrowserRouter>
      <Routes>
        <Route path="/" element={<Body />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>

     </Provider>
   </>
  );
}

export default App;