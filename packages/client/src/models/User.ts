import { types, onSnapshot } from 'mobx-state-tree';
import { obfuscate } from '../utils';
// import {on}

const initialState = {
  loggedIn: false,
  user: null
};

export const UserModel = types
  .model({
    loggedIn: false,
    data: types.maybeNull(types.frozen())
  })
  .actions((self) => ({
    setLoggedInState(loggedIn: boolean) {
      self.loggedIn = loggedIn;
    },
    updateUserData(data: any) {
      self.data = data;
    }
  }));

// Local storage persistence check for store data.
if (localStorage.getItem('_a')) {
  initialState.user = JSON.parse(obfuscate(localStorage.getItem('_a') || '', 12123, false));
  initialState.loggedIn = true;
}

export const User = UserModel.create(initialState);

// Update persisted store on snapshot.
onSnapshot(User, (snapshot) => {
  localStorage.setItem('_a', obfuscate(JSON.stringify(snapshot), 12123));
});
