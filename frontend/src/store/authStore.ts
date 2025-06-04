import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserPrimaryData {
  UserID: number;
  Username: string;
  Email: string;
  PhoneNumber: string;
  Role: string;
}

export interface AppUser {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: string;
  isProfileComplete?: boolean;
}

interface AuthState {
  user: AppUser | null;
  token: string | null;
  loginError: string | null;
  signupError: string | null;
  isLoading: boolean;
  isAuthenticated: () => boolean;
  loginSuccess: (userDataFromApi: UserPrimaryData, token: string) => void;
  logout: () => void;
  setLoginError: (error: string | null) => void;
  setSignupError: (error: string | null) => void;
  setIsLoading: (loading: boolean) => void;
  //method for updating isProfileComplete later
  //updateUserProfileStatus: (isComplete: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      loginError: null,
      signupError: null,
      isLoading: false,
      isAuthenticated: () => !!get().token && !!get().user,
      loginSuccess: (userDataFromApi: UserPrimaryData, token: string) => {
        const appUser: AppUser = {
          id: String(userDataFromApi.UserID),
          fullName: userDataFromApi.Username,
          email: userDataFromApi.Email,
          phoneNumber: userDataFromApi.PhoneNumber,
          role: userDataFromApi.Role,
          // isProfileComplete is not part of this API login response. It would fethced later.
        };
        set({ user: appUser, token, loginError: null, isLoading: false });
      },
      logout: () =>
        set({ user: null, token: null, loginError: null, isLoading: false }),
      setLoginError: (error: string | null) =>
        set({ loginError: error, isLoading: false }),
      setSignupError: (
        error: string | null // New: Implement setSignupError
      ) => set({ signupError: error, isLoading: false }), 
      setIsLoading: (loading: boolean) => set({ isLoading: loading }),
    }),
    {
      name: "auth-session-storage",
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          return str ? JSON.parse(str) : null;
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          localStorage.removeItem(name);
        },
      },
      partialize: (state: AuthState) => ({
        token: state.token,
        user: state.user,
      }),
    }
  )
);
