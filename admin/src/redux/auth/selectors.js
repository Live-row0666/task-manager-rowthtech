import { createSelector } from 'reselect';

const getAuthState = (state) => state.Auth;

export const getAuthData = createSelector(
    [getAuthState],
    (auth) => ({
        loading: auth.loading,
        user: auth.user,
        error: auth.error,
        userLoggedIn: auth.userLoggedIn,
    })
);