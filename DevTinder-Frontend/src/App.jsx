import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import appStore from "./utils/appStore";
import Body from "./components/Body";
import Login from "./components/Login";
import Profile from "./components/Profile";
import Home from "./components/Home";
import Feed from "./components/Feed";
import Connections from "./components/Connections";
import Requests from "./components/Requests";

function App() {
  return (
    <Provider store={appStore}>
      <BrowserRouter>
        <Routes>
          {/* Main Layout Wrapper */}
          <Route path="/" element={<Body />}>
  <Route index element={<Home />} />
  <Route path="login" element={<Login />} />
  <Route path="profile" element={<Profile />} />
  <Route path="feed" element={<Feed />} />
  <Route path="connections" element={<Connections />} />
  <Route path="requests" element={<Requests />} />

</Route>


        </Routes>
      </BrowserRouter>
    </Provider>
  );
}
export default App;
