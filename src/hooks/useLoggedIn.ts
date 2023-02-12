import { useState } from 'react';
import { isLoggedIn } from 'src/api/isLoggedIn';

export function useLoggedIn() {
    const [loggedIn, setLoggedIn] = useState(false);
    if (loggedIn) {
        return true;
    }
    void isLoggedIn().then(loggedIn => {
        if (loggedIn) {
            setLoggedIn(true);
        }
    });
}