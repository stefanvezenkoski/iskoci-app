import { useSignUp } from '@clerk/clerk-expo';
import { Link } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignUp = async () => {
    if (!isLoaded || isSubmitting) return;
    setError('');
    setIsSubmitting(true);

    try {
      await signUp.create({
        emailAddress: email.trim(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        username: username.trim(),
      });
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
    } catch (signUpError: any) {
      setError(signUpError?.errors?.[0]?.longMessage ?? 'Unable to create your account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerification = async () => {
    if (!isLoaded || isSubmitting) return;
    setError('');
    setIsSubmitting(true);

    try {
      const result = await signUp.attemptEmailAddressVerification({ code: code.trim() });
      if (result.status === 'complete' && result.createdSessionId) {
        await setActive({ session: result.createdSessionId });
      } else {
        const missingFields = result.missingFields?.join(', ');
        const unverifiedFields = result.unverifiedFields?.join(', ');
        setError(`More verification is required${missingFields ? `: ${missingFields}` : ''}${unverifiedFields ? ` (${unverifiedFields})` : ''}.`);
      }
    } catch (verificationError: any) {
      setError(verificationError?.errors?.[0]?.longMessage ?? 'That verification code is not valid.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>ISKOCI</Text>
          <Text style={styles.title}>{pendingVerification ? 'Check your email' : 'Join the plan'}</Text>
          <Text style={styles.subtitle}>{pendingVerification ? `Enter the code we sent to ${email}.` : 'Create an account and never miss the good stuff.'}</Text>
        </View>

        <View style={styles.form}>
          {pendingVerification ? (
            <TextInput autoCapitalize="none" keyboardType="number-pad" onChangeText={setCode} placeholder="Verification code" placeholderTextColor="#8F8B89" style={styles.input} value={code} />
          ) : (
            <>
              <View style={styles.nameRow}>
                <TextInput autoCapitalize="words" onChangeText={setFirstName} placeholder="First name" placeholderTextColor="#8F8B89" style={[styles.input, styles.nameInput]} value={firstName} />
                <TextInput autoCapitalize="words" onChangeText={setLastName} placeholder="Last name" placeholderTextColor="#8F8B89" style={[styles.input, styles.nameInput]} value={lastName} />
              </View>
              <TextInput autoCapitalize="none" autoComplete="username" onChangeText={setUsername} placeholder="Username" placeholderTextColor="#8F8B89" style={styles.input} value={username} />
              <TextInput autoCapitalize="none" autoComplete="email" keyboardType="email-address" onChangeText={setEmail} placeholder="Email address" placeholderTextColor="#8F8B89" style={styles.input} value={email} />
              <TextInput autoCapitalize="none" autoComplete="new-password" onChangeText={setPassword} placeholder="Password" placeholderTextColor="#8F8B89" secureTextEntry style={styles.input} value={password} />
            </>
          )}
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Pressable disabled={isSubmitting} onPress={pendingVerification ? handleVerification : handleSignUp} style={styles.primaryButton}>
            {isSubmitting ? <ActivityIndicator color="#111111" /> : <Text style={styles.primaryButtonText}>{pendingVerification ? 'Verify email' : 'Create account'}</Text>}
          </Pressable>
        </View>

        <Text style={styles.footerText}>Already have an account? <Link href="/sign-in" style={styles.link}>Sign in</Link></Text>
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
  subtitle: { color: '#B7B2AF', fontSize: 16, lineHeight: 23, marginTop: 10, fontFamily: 'Wix Madefor Text' },
  form: { gap: 14 },
  nameRow: { flexDirection: 'row', gap: 10 },
  nameInput: { flex: 1 },
  input: { backgroundColor: '#232727', borderRadius: 16, color: '#FFF', fontSize: 16, paddingHorizontal: 17, paddingVertical: 16, fontFamily: 'Wix Madefor Text' },
  error: { color: '#FF8B86', fontSize: 13, fontFamily: 'Wix Madefor Text' },
  primaryButton: { alignItems: 'center', backgroundColor: '#FFF', borderRadius: 17, justifyContent: 'center', minHeight: 56, marginTop: 4 },
  primaryButtonText: { color: '#111', fontSize: 16, fontFamily: 'Climate Crisis' },
  footerText: { color: '#9E9997', fontSize: 14, marginTop: 28, textAlign: 'center', fontFamily: 'Wix Madefor Text' },
  link: { color: '#63E6DC', fontFamily: 'Wix Madefor Text' },
});
