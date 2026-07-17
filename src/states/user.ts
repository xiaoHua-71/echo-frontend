import {UserType} from "../models/user";

let currentUser: UserType;

const setCurrentUserState = (user: UserType) => {
    currentUser = user;
}

const getCurrentUserState = () : UserType => {
    return currentUser;
}

const clearCurrentUserState = () => {
    currentUser = undefined as unknown as UserType;
}

export {
    setCurrentUserState,
    getCurrentUserState,
    clearCurrentUserState,
}