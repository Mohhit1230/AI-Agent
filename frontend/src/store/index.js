import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Ignore non-serializable values in specific paths
                ignoredActions: ["auth/setUser"],
            },
        }),
    devTools: import.meta.env.DEV,
});

export default store;
