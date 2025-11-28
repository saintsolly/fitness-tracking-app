import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../../services/supabaseClient';

export const AuthContext = createContext(null);

export default function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId) => {
    const { data, error, status } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    if (error && status !== 406) {
      console.error('Unable to load profile', error);
      setProfile(null);
      return;
    }
    setProfile(data ?? null);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const hydrate = async () => {
      const {
        data: { session: initialSession },
      } = await supabase.auth.getSession();
      if (!isMounted) return;
      setSession(initialSession);
      if (initialSession?.user) {
        await fetchProfile(initialSession.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    };

    hydrate();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (nextSession?.user) {
        fetchProfile(nextSession.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const login = useCallback(async ({ email, password }) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      throw error;
    }
  }, []);

  const register = useCallback(async ({ email, password, name }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    });
    if (error) {
      throw error;
    }
    if (data.user) {
      await supabase.from('profiles').upsert(
        {
          id: data.user.id,
          full_name: name,
          onboarding_complete: false,
        },
        { onConflict: 'id' }
      );
      await fetchProfile(data.user.id);
    }
  }, [fetchProfile]);

  const completeOnboarding = useCallback(async (preferences) => {
    if (!profile) return;
    const { error, data } = await supabase
      .from('profiles')
      .update({
        preferred_focus: preferences.preferredFocus,
        units: preferences.units,
        wearable_connected: preferences.wearableConnected,
        onboarding_complete: true,
      })
      .eq('id', profile.id)
      .select()
      .single();
    if (error) {
      throw error;
    }
    setProfile(data);
  }, [profile]);

  const updateProfile = useCallback(async (updates) => {
    if (!profile) return;
    const { error, data } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', profile.id)
      .select()
      .single();
    if (error) {
      throw error;
    }
    setProfile(data);
  }, [profile]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setSession(null);
  }, []);

  const normalizedUser = useMemo(() => {
    if (!profile || !session?.user) return null;
    return {
      id: profile.id,
      name: profile.full_name || session.user.email,
      email: session.user.email,
      avatarUrl: profile.avatar_url,
      onboardingComplete: profile.onboarding_complete,
      units: profile.units,
      preferredFocus: profile.preferred_focus,
      wearableConnected: profile.wearable_connected,
    };
  }, [profile, session]);

  const refreshProfile = useCallback(
    () => (normalizedUser ? fetchProfile(normalizedUser.id) : null),
    [normalizedUser, fetchProfile]
  );

  const value = useMemo(
    () => ({
      user: normalizedUser,
      loading,
      session,
      isAuthenticated: Boolean(normalizedUser),
      onboardingComplete: Boolean(normalizedUser?.onboardingComplete),
      login,
      register,
      completeOnboarding,
      logout,
      updateProfile,
      refreshProfile,
    }),
    [normalizedUser, loading, session, completeOnboarding, login, register, updateProfile, logout, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

