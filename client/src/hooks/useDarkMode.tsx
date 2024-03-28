import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleDarkMode } from '../modules/darkSlice';
import { RootState } from '../modules';

export type useDark = [boolean, (text: string) => void];

const useDarkMode = (): useDark => {
    const isDark = useSelector((state: RootState) => state.dark.isDark);
    const dispatch = useDispatch();

    useEffect(() => {
        if (isDark) {
            localStorage.theme = 'dark';
            document.documentElement.classList.add('dark');
        } else {
            localStorage.theme = 'light';
            document.documentElement.classList.remove('dark');
        }
    }, [isDark]);

    const onToggleDarkMode = (text: string): void => {
        dispatch(toggleDarkMode(text));
    };

    return [isDark, onToggleDarkMode];
};

export default useDarkMode;