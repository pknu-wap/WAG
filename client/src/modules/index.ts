import { configureStore } from '@reduxjs/toolkit';
import darkSlice from './darkSlice';
const store = configureStore({
    reducer: {
        dark: darkSlice.reducer,
    },
});

export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;