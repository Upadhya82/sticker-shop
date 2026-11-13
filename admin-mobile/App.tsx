import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { Session } from '@supabase/supabase-js';
import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { supabase } from './lib/supabase';
import PortfolioManager from './components/PortfolioManager';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

type Appointment = {
  id: string;
  customer_name: string;
  phone: string;
  service_type: string;
  appointment_date: string;
  time_slot: string;
  created_at: string;
};

const DEMO_EMAIL = 'owner-demo@ruwansticker.test';
const DEMO_PASSWORD = 'TestOwner123!';

function getDemoAppointments(): Appointment[] {
  const dateAfter = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const now = new Date().toISOString();

  return [
    {
      id: 'demo-appointment-1',
      customer_name: 'Kasun Perera (Demo)',
      phone: 'Demo customer',
      service_type: 'Car window sticker',
      appointment_date: dateAfter(1),
      time_slot: '09:00',
      created_at: now,
    },
    {
      id: 'demo-appointment-2',
      customer_name: 'Nimali Fernando (Demo)',
      phone: 'Demo customer',
      service_type: 'Vehicle branding',
      appointment_date: dateAfter(2),
      time_slot: '13:30',
      created_at: now,
    },
  ];
}

function isAdmin(session: Session | null) {
  return session?.user.app_metadata?.role === 'admin';
}

function formatDate(date: string) {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  });
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [demoMode, setDemoMode] = useState(false);
  const [authReady, setAuthReady] = useState(!supabase);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pushStatus, setPushStatus] = useState('');

  const loadAppointments = useCallback(async () => {
    if (__DEV__ && demoMode) {
      setAppointments(getDemoAppointments());
      return;
    }
    if (!supabase || !isAdmin(session)) return;
    setLoading(true);
    setError('');
    const { data, error: queryError } = await supabase
      .from('appointments')
      .select('id, customer_name, phone, service_type, appointment_date, time_slot, created_at')
      .order('appointment_date', { ascending: true })
      .order('time_slot', { ascending: true });
    if (queryError) setError(queryError.message);
    else setAppointments((data ?? []) as Appointment[]);
    setLoading(false);
  }, [demoMode, session]);

  useEffect(() => {
    if (!supabase || demoMode) return;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthReady(true);
      if (isAdmin(nextSession)) void loadAppointments();
      else setAppointments([]);
    });
    return () => subscription.unsubscribe();
  }, [demoMode, loadAppointments]);

  useEffect(() => {
    const client = supabase;
    if (!client || demoMode || !isAdmin(session)) return;
    let canceled = false;

    async function registerPushDevice() {
      try {
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('appointments', {
            name: 'Appointments',
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FBBF24',
          });
        }

        let permission = await Notifications.getPermissionsAsync();
        if (permission.status !== 'granted') permission = await Notifications.requestPermissionsAsync();
        if (permission.status !== 'granted') {
          if (!canceled) setPushStatus('Notifications are turned off for this app.');
          return;
        }

        const projectId = process.env.EXPO_PUBLIC_EAS_PROJECT_ID
          || Constants.easConfig?.projectId
          || Constants.expoConfig?.extra?.eas?.projectId;
        if (!projectId) {
          if (!canceled) setPushStatus('Push setup needs an Expo EAS project ID.');
          return;
        }

        const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
        const { error: tokenError } = await client!.from('admin_devices').upsert({
          admin_user_id: session!.user.id,
          expo_push_token: token,
          last_seen_at: new Date().toISOString(),
        }, { onConflict: 'expo_push_token' });
        if (tokenError) throw tokenError;
        if (!canceled) setPushStatus('This phone is registered for appointment notifications.');
      } catch (pushError) {
        if (!canceled) setPushStatus(pushError instanceof Error ? pushError.message : 'Could not set up notifications.');
      }
    }

    void registerPushDevice();
    return () => { canceled = true; };
  }, [demoMode, session]);

  async function signIn() {
    if (__DEV__ && email.trim().toLowerCase() === DEMO_EMAIL && password === DEMO_PASSWORD) {
      setError('');
      setDemoMode(true);
      setAppointments(getDemoAppointments());
      return;
    }
    if (!supabase) {
      setError('Demo sign in only: use the test email and password shown below.');
      return;
    }
    setError('');
    setLoading(true);
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(), password,
    });
    setLoading(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }
    if (!isAdmin(data.session)) {
      await supabase.auth.signOut();
      setError('This account does not have admin access. Ask the shop owner to configure the admin role.');
    }
  }

  async function signOut() {
    if (demoMode) {
      setDemoMode(false);
      setAppointments([]);
      setEmail('');
      setPassword('');
      return;
    }
    if (!supabase) return;
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) setError(signOutError.message);
    else {
      setSession(null);
      setAppointments([]);
    }
  }

  if (!authReady) return <Centered><ActivityIndicator color="#fbbf24" /></Centered>;

  if (!supabase && !__DEV__) {
    return <Centered>
      <Text style={styles.title}>Connect Supabase</Text>
      <Text style={styles.muted}>Copy .env.example to .env and add the project URL and publishable key.</Text>
    </Centered>;
  }

  if (!demoMode && !isAdmin(session)) {
    return <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      <KeyboardAvoidingView style={styles.center} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.loginCard}>
          <Text style={styles.eyebrow}>RUWAN STICKER</Text>
          <Text style={styles.title}>Owner sign in</Text>
          <Text style={styles.muted}>
            {supabase ? 'Sign in with the admin account created in Supabase.' : 'Use the local demo account to preview the owner app.'}
          </Text>
          {__DEV__ ? (
            <View style={styles.demoBox}>
              <Text style={styles.demoTitle}>Local test account (development only)</Text>
              <Text style={styles.demoText}>Email: {DEMO_EMAIL}</Text>
              <Text style={styles.demoText}>Password: {DEMO_PASSWORD}</Text>
              <Text style={styles.demoNote}>This opens sample bookings. It does not connect to the live shop data.</Text>
            </View>
          ) : null}
          <TextInput autoCapitalize="none" autoCorrect={false} keyboardType="email-address" placeholder="Email" placeholderTextColor="#71717a" value={email} onChangeText={setEmail} style={styles.input} />
          <TextInput secureTextEntry placeholder="Password" placeholderTextColor="#71717a" value={password} onChangeText={setPassword} style={styles.input} />
          {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
          <Pressable accessibilityRole="button" onPress={signIn} disabled={loading || !email.trim() || !password} style={({ pressed }) => [styles.button, pressed && styles.pressed, (loading || !email.trim() || !password) && styles.disabled]}>
            {loading ? <ActivityIndicator color="#111" /> : <Text style={styles.buttonText}>Sign in</Text>}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>;
  }

  return <SafeAreaView style={styles.safe}>
    <StatusBar style="light" />
    <View style={styles.header}>
      <View>
        <Text style={styles.eyebrow}>RUWAN STICKER</Text>
        <Text style={styles.title}>{demoMode ? 'Demo Appointments' : 'Appointments'}</Text>
      </View>
      <Pressable onPress={signOut} accessibilityRole="button"><Text style={styles.link}>Sign out</Text></Pressable>
    </View>
    {demoMode ? <Text style={styles.demoBanner}>DEMO MODE · Sample bookings only · No live data changes</Text> : null}
    <View style={styles.toolbar}>
      <Text style={styles.muted}>{appointments.length} booking{appointments.length === 1 ? '' : 's'}</Text>
      <Pressable onPress={loadAppointments} accessibilityRole="button" style={styles.refresh}><Text style={styles.refreshText}>Refresh</Text></Pressable>
    </View>
    {pushStatus ? <Text style={styles.pushStatus}>{pushStatus}</Text> : null}
    {error ? <Text accessibilityRole="alert" style={[styles.error, styles.pageError]}>{error}</Text> : null}
    {loading && appointments.length === 0 ? <ActivityIndicator color="#fbbf24" style={{ marginTop: 32 }} /> : null}
    {!loading && appointments.length === 0 ? <Text style={styles.empty}>No appointments yet.</Text> : null}
    <FlatList
      data={appointments}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      ListFooterComponent={demoMode ? (
        <View style={styles.demoFooter}>
          <Text style={styles.demoTitle}>Portfolio manager</Text>
          <Text style={styles.demoNote}>Connect a real Supabase admin account to test photo uploads.</Text>
        </View>
      ) : <PortfolioManager session={session!} />}
      renderItem={({ item }) => <View style={styles.card}>
        <View style={styles.cardTop}>
          <Text style={styles.slot}>{formatDate(item.appointment_date)}</Text>
          <Text style={styles.time}>{item.time_slot}</Text>
        </View>
        <Text style={styles.customer}>{item.customer_name}</Text>
        <Text style={styles.detail}>{item.phone}</Text>
        <Text style={styles.service}>{item.service_type}</Text>
      </View>}
    />
  </SafeAreaView>;
}

function Centered({ children }: { children: React.ReactNode }) {
  return <SafeAreaView style={styles.safe}><StatusBar style="light" /><View style={styles.center}>{children}</View></SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#09090b' },
  center: { flex: 1, justifyContent: 'center', padding: 24 },
  loginCard: { gap: 14, borderRadius: 22, borderWidth: 1, borderColor: '#27272a', backgroundColor: '#18181b', padding: 22 },
  demoBox: { gap: 5, borderRadius: 12, borderWidth: 1, borderColor: '#854d0e', backgroundColor: '#422006', padding: 12 },
  demoTitle: { color: '#fde68a', fontWeight: '800', fontSize: 13 },
  demoText: { color: '#fef3c7', fontSize: 13 },
  demoNote: { color: '#d6d3d1', fontSize: 12, lineHeight: 17, marginTop: 3 },
  demoBanner: { color: '#fde68a', backgroundColor: '#422006', marginHorizontal: 20, marginBottom: 8, padding: 10, borderRadius: 10, fontSize: 12, fontWeight: '700' },
  demoFooter: { gap: 5, borderRadius: 16, borderWidth: 1, borderColor: '#854d0e', backgroundColor: '#18181b', padding: 16, marginTop: 8 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 18, paddingBottom: 12 },
  toolbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 },
  eyebrow: { color: '#a1a1aa', fontSize: 11, fontWeight: '700', letterSpacing: 2 },
  title: { color: '#fafafa', fontSize: 29, fontWeight: '800', marginTop: 5 },
  muted: { color: '#a1a1aa', fontSize: 14, lineHeight: 20 },
  input: { minHeight: 50, borderRadius: 12, borderWidth: 1, borderColor: '#3f3f46', backgroundColor: '#09090b', color: '#fafafa', paddingHorizontal: 14, fontSize: 15 },
  button: { minHeight: 50, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: '#fbbf24', marginTop: 4 },
  buttonText: { color: '#18181b', fontWeight: '800', fontSize: 15 },
  pressed: { opacity: 0.8 },
  disabled: { opacity: 0.5 },
  error: { color: '#fca5a5', fontSize: 13, lineHeight: 19 },
  pageError: { marginHorizontal: 20, marginBottom: 8 },
  link: { color: '#fbbf24', fontWeight: '700', padding: 8 },
  refresh: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 9, borderWidth: 1, borderColor: '#3f3f46' },
  refreshText: { color: '#fafafa', fontWeight: '600' },
  list: { padding: 16, gap: 12 },
  card: { borderRadius: 16, borderWidth: 1, borderColor: '#27272a', backgroundColor: '#18181b', padding: 16, gap: 5 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  slot: { color: '#fbbf24', fontWeight: '700', fontSize: 14 },
  time: { color: '#fafafa', fontWeight: '800', fontSize: 16 },
  customer: { color: '#fafafa', fontWeight: '700', fontSize: 17 },
  detail: { color: '#d4d4d8', fontSize: 14 },
  service: { color: '#a1a1aa', fontSize: 13, marginTop: 3 },
  empty: { color: '#a1a1aa', textAlign: 'center', marginTop: 35 },
  pushStatus: { color: '#a1a1aa', fontSize: 12, paddingHorizontal: 20, paddingBottom: 8 },
});
