import { useSignIn } from '@clerk/clerk-expo';
import { Link } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';

export default function SignInScreen() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignIn = async () => {
    if (!isLoaded || isSubmitting) return;
    setError('');
    setIsSubmitting(true);

    try {
      const result = await signIn.create({
        identifier: email.trim(),
        password,
      });

      if (result.status === 'complete' && result.createdSessionId) {
        await setActive({ session: result.createdSessionId });
      } else {
        setError('Additional verification is required in Clerk.');
      }
    } catch (signInError: any) {
      setError(signInError?.errors?.[0]?.longMessage ?? 'Unable to sign in. Check your details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>ISKOCI</Text>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to find your next plan.</Text>
        </View>

        <View style={styles.form}>
          <TextInput autoCapitalize="none" autoComplete="email" keyboardType="email-address" onChangeText={setEmail} placeholder="Email address" placeholderTextColor="#8F8B89" style={styles.input} value={email} />
          <TextInput autoCapitalize="none" autoComplete="password" onChangeText={setPassword} placeholder="Password" placeholderTextColor="#8F8B89" secureTextEntry style={styles.input} value={password} />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Pressable disabled={isSubmitting} onPress={handleSignIn} style={styles.primaryButton}>
            {isSubmitting ? <ActivityIndicator color="#111111" /> : <Text style={styles.primaryButtonText}>Sign in</Text>}
          </Pressable>
        </View>

        <Text style={styles.footerText}>New to Iskoci? <Link href="/sign-up" style={styles.link}>Create an account</Link></Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#090c0c' },
  container: { flex: 1, paddingHorizontal: 25, justifyContent: 'center' },
  header: { marginBottom: 34 },
  eyebrow: { color: '#63E6DC', fontSize: 13, fontWeight: '800', letterSpacing: 2, fontFamily: 'Wix Madefor Text' },
  title: { color: '#FFF', fontSize: 40, lineHeight: 48, marginTop: 12, fontFamily: 'Climate Crisis' },
  subtitle: { color: '#B7B2AF', fontSize: 16, marginTop: 10, fontFamily: 'Wix Madefor Text' },
  form: { gap: 14 },
  input: { backgroundColor: '#232727', borderRadius: 16, color: '#FFF', fontSize: 16, paddingHorizontal: 17, paddingVertical: 16, fontFamily: 'Wix Madefor Text' },
  error: { color: '#FF8B86', fontSize: 13, fontFamily: 'Wix Madefor Text' },
  primaryButton: { alignItems: 'center', backgroundColor: '#FFF', borderRadius: 17, justifyContent: 'center', minHeight: 56, marginTop: 4 },
  primaryButtonText: { color: '#111', fontSize: 16, fontFamily: 'Climate Crisis' },
  footerText: { color: '#9E9997', fontSize: 14, marginTop: 28, textAlign: 'center', fontFamily: 'Wix Madefor Text' },
  link: { color: '#63E6DC', fontFamily: 'Wix Madefor Text' },
});
