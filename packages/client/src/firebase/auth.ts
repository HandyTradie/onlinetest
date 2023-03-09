import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { auth } from '.';
import { User } from '../models/User';

// Firebase utility hook for creating a user with an email and password.
export const useCreateUserWithEmailAndPassword = () =>
  useMutation(
    async ({ email, password }: { email: string; password: string }) =>
      createUserWithEmailAndPassword(auth, email, password),
    {
      onSuccess: () => {
        User.setLoggedInState(true);
      }
    }
  );

// Utility hook for logging in a user with an email and password.
export const useSignInWithEmailAndPassword = () => {
  const navigate = useNavigate();

  return useMutation(
    async ({
      email,
      password,
      redirectTo
    }: {
      email: string;
      password: string;
      redirectTo?: string;
    }) => signInWithEmailAndPassword(auth, email, password),
    {
      onSuccess: (user, { redirectTo }) => {
        User.setLoggedInState(true);
        // Redirect to the specified page if one was provided.
        if (redirectTo) {
          navigate(redirectTo);
        }
      }
    }
  );
};

// Utitlity function for logging out a user.
export const signOutUser = () => {
  auth.signOut();
  User.setLoggedInState(false);
  User.updateUserData(null);
};

// Register auth state listener.
auth.onAuthStateChanged((user) => {
  if (user) {
    // Set user in store.
    User.setLoggedInState(true);
    // Update user deta
    User.updateUserData(user);
  } else {
    // Clear user in store.
    // User.setLoggedInState(false);
    // User.updateUserData(null);
  }
});

export const getAuthToken = async () => await auth.currentUser?.getIdToken();
