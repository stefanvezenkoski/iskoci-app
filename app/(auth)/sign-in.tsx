import { useOAuth, useSignIn } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Link } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { AmbientBackground } from '@/components/ambient-background';

WebBrowser.maybeCompleteAuthSession();

export default function SignInScreen() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  const handleSignIn = async () => {
    if (!isLoaded || isSubmitting) return;
    await Haptics.selectionAsync();
    setError('');
    setIsSubmitting(true);

    try {
      const result = await signIn.create({
        identifier: email.trim(),
        password,
      });

      if (result.status === 'complete' && result.createdSessionId) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await setActive({ session: result.createdSessionId });
      } else {
        setError('Потребна е дополнителна верификација на сметката.');
      }
    } catch (signInError: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(signInError?.errors?.[0]?.longMessage ?? 'Погрешен е-маил или лозинка.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = useCallback(async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setError('');
      setIsGoogleSubmitting(true);

      const { createdSessionId, setActive: setOAuthActive } = await startOAuthFlow();
      if (createdSessionId && setOAuthActive) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await setOAuthActive({ session: createdSessionId });
      }
    } catch (err: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(err?.errors?.[0]?.longMessage ?? 'Најавата со Google не успеа.');
    } finally {
      setIsGoogleSubmitting(false);
    }
  }, [startOAuthFlow]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <AmbientBackground />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <View style={styles.header}>
          <Text style={styles.eyebrow}>ИСКОЧИ</Text>
          <Text style={styles.title}>Добредојде{'\n'}назад</Text>
          <Text style={styles.subtitle}>Најави се за да не пропуштиш ништо во градот.</Text>
        </View>

        <View style={styles.form}>
          {/* Email input */}
          <TextInput
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="Е-маил адреса"
            placeholderTextColor="#8F8B89"
            style={styles.input}
            value={email}
          />

          {/* Password input with show/hide eye toggle */}
          <View style={styles.passwordContainer}>
            <TextInput
              autoCapitalize="none"
              autoComplete="password"
              onChangeText={setPassword}
              placeholder="Лозинка"
              placeholderTextColor="#8F8B89"
              secureTextEntry={!showPassword}
              style={styles.passwordInput}
              value={password}
            />
            <Pressable
              hitSlop={12}
              onPress={async () => {
                await Haptics.selectionAsync();
                setShowPassword((prev) => !prev);
              }}
              style={styles.eyeButton}
              accessibilityLabel={showPassword ? 'Скриј лозинка' : 'Прикажи лозинка'}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={21}
                color={showPassword ? '#63E6DC' : '#8F8B89'}
              />
            </Pressable>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          {/* Sign In button */}
          <Pressable
            disabled={isSubmitting || isGoogleSubmitting}
            onPress={handleSignIn}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && { opacity: 0.9, transform: [{ scale: 0.985 }] },
            ]}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#111111" />
            ) : (
              <Text style={styles.primaryButtonText}>Најави се</Text>
            )}
          </Pressable>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>или</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google Sign In Button */}
          <Pressable
            disabled={isSubmitting || isGoogleSubmitting}
            onPress={handleGoogleSignIn}
            style={({ pressed }) => [
              styles.googleButton,
              pressed && { opacity: 0.85, transform: [{ scale: 0.985 }] },
            ]}
          >
            {isGoogleSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="logo-google" size={19} color="#EA4335" />
                <Text style={styles.googleButtonText}>Продолжи со Google</Text>
              </>
            )}
          </Pressable>
        </View>

        <Text style={styles.footerText}>
          Немаш сметка?{' '}
          <Link href="/sign-up" style={styles.link}>
            Креирај сметка
          </Link>
        </Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#090C0C' },
  container: { flex: 1, paddingHorizontal: 25, justifyContent: 'center' },
  header: { marginBottom: 30 },
  eyebrow: {
    color: '#63E6DC',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 2,
    fontFamily: 'Wix Madefor Text',
  },
  title: {
    color: '#FFF',
    fontSize: 38,
    lineHeight: 46,
    marginTop: 10,
    fontFamily: 'Climate Crisis',
  },
  subtitle: {
    color: '#B7B2AF',
    fontSize: 15,
    marginTop: 10,
    fontFamily: 'Wix Madefor Text',
  },
  form: { gap: 13 },
  input: {
    backgroundColor: '#1B2120',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    color: '#FFF',
    fontSize: 16,
    paddingHorizontal: 17,
    paddingVertical: 15,
    fontFamily: 'Wix Madefor Text',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1B2120',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingRight: 14,
  },
  passwordInput: {
    flex: 1,
    color: '#FFF',
    fontSize: 16,
    paddingHorizontal: 17,
    paddingVertical: 15,
    fontFamily: 'Wix Madefor Text',
  },
  eyeButton: {
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {
    color: '#FF7771',
    fontSize: 13,
    fontFamily: 'Wix Madefor Text',
    paddingHorizontal: 2,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 17,
    justifyContent: 'center',
    minHeight: 54,
    marginTop: 4,
    shadowColor: '#FFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#111',
    fontSize: 16,
    fontFamily: 'Climate Crisis',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.09)',
  },
  dividerText: {
    color: '#778180',
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Wix Madefor Text',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    borderRadius: 17,
    minHeight: 54,
  },
  googleButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Wix Madefor Text',
  },
  footerText: {
    color: '#9E9997',
    fontSize: 14,
    marginTop: 26,
    textAlign: 'center',
    fontFamily: 'Wix Madefor Text',
  },
  link: {
    color: '#63E6DC',
    fontWeight: '700',
    fontFamily: 'Wix Madefor Text',
  },
});
