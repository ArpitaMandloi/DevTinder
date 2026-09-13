import {configureStore} from '@reduxjs/toolkit'
import userReducer from "./userSlice";
import feedReducer from "./feedSlice";
import connectionReducer from './connectionSlice';
import requestReducer from "./requestSlice";
import chatReducer from "./chatSlice";
import notificationReducer from "./notificationSlice";

const appStore = configureStore({
   reducer : {
    user : userReducer,
    feed : feedReducer,
    connections : connectionReducer,
    requests : requestReducer,
    chat : chatReducer,
    notifications : notificationReducer,
   },
});

export default appStore;