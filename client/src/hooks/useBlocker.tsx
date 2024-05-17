import { useEffect, useContext, useCallback } from 'react';
import { UNSAFE_NavigationContext as NavigationContext } from 'react-router-dom';

export function useBlocker(blocker: (tx: any) => void, when = true) {
    const { navigator } = useContext(NavigationContext);

    useEffect(() => {
        if (!when) return;

        const push = navigator.push;
        const replace = navigator.replace;

        navigator.push = (...args) => {
            blocker({ action: 'PUSH', args });
        };

        navigator.replace = (...args) => {
            blocker({ action: 'REPLACE', args });
        };

        return () => {
            navigator.push = push;
            navigator.replace = replace;
        };
    }, [navigator, blocker, when]);
}


export function usePrompt(message: any, when = true) {
    const blocker = useCallback((tx: any) => {
        //   eslint-disable-next-line no-alert
        if (window.confirm(message)) tx.retry();
    }, [message]);

    useBlocker(blocker, when);
}