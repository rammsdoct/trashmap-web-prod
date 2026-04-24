import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signInWithPopup, signOut, updateProfile } from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]           = useState(undefined); // undefined = still loading
  const [signingIn, setSigningIn] = useState(false);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthError(null);
    });
    return unsub;
  }, []);

  const signInWithGoogle = async () => {
    setSigningIn(true);
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      if (e.code !== "auth/popup-closed-by-user") {
        setAuthError("No se pudo iniciar sesión. Intenta de nuevo.");
      }
    } finally {
      setSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
  };

  const updateDisplayName = async (name) => {
    if (!auth.currentUser) return;
    await updateProfile(auth.currentUser, { displayName: name });
    setUser({ ...auth.currentUser });
  };

  return (
    <AuthContext.Provider value={{ user, signingIn, authError, signInWithGoogle, handleSignOut, updateDisplayName }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
