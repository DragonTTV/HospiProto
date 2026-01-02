import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const checkUser = async () => {
      try {
        // 1. TIMEOUT RACE: If Supabase takes > 2 seconds, force logout.
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 2000)
        );

        // 2. Fetch Session
        const sessionPromise = supabase.auth.getSession();
        
        // Race them!
        const { data: { session }, error } = await Promise.race([sessionPromise, timeoutPromise]);

        if (error) throw error;

        if (session?.user) {
          await fetchProfile(session.user);
        } else {
          // No session? Good, just stop loading.
          if (mounted) setLoading(false);
        }
      } catch (err) {
        console.error("🔥 Auto-Correction: Wiping invalid session.", err);
        // FORCE WIPE everything if anything goes wrong
        await supabase.auth.signOut();
        localStorage.clear(); 
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
      }
    };

    checkUser();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await fetchProfile(session.user);
      } else {
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (authUser) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) {
        // If profile is missing, keep them logged in but as 'staff' to avoid crash
        setUser({ ...authUser, role: 'staff' });
      } else {
        setUser({ ...authUser, ...data });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: error.message };
    return { success: true };
  };

 const logout = async () => {
    setUser(null);
    localStorage.clear();
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Logout error:", error);
    }
    window.location.replace('/');
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-500">Loading Hospiverse...</p>
        {/* Helper button in case it STILL gets stuck */}
        <button 
          onClick={() => { localStorage.clear(); window.location.reload(); }}
          className="mt-4 text-xs text-red-500 hover:underline"
        >
          Stuck? Click to Reset
        </button>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);