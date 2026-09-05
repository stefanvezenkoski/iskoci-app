import { useOAuth, useSignUp } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Link } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { AmbientBackground } from '@/components/ambient-background';

WebBrowser.maybeCompleteAuthSession();

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [code, setCode] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  const handleSignUp = async () => {
    if (!isLoaded || isSubmitting) return;
    setError('');

    // Form validations to prevent password errors
    if (!firstName.trim()) {
      setError('Ве молиме внесете име.');
      return;
    }
    if (!email.trim()) {
      setError('Ве молиме внесете е-маил адреса.');
      return;
    }
    if (password.length < 8) {
      setError('Лозинката мора да содржи најмалку 8 карактери.');
      return;
    }
    if (password !== confirmPassword) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError('Лозинките не се совпаѓаат. Проверете ги повторно.');
      return;
    }

    await Haptics.selectionAsync();
    setIsSubmitting(true);

    try {
      await signUp.create({
        emailAddress: email.trim(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        username: username.trim() || undefined,
      });
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setPendingVerification(true);
    } catch (signUpError: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(signUpError?.errors?.[0]?.longMessage ?? 'Не успеа креирањето на сметката.');
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
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await SecureStore.setItemAsync('just_signed_up', 'true');
        await setActive({ session: result.createdSessionId });
      } else {
        const missingFields = result.missingFields?.join(', ');
        const unverifiedFields = result.unverifiedFields?.join(', ');
        setError(`Потребна е дополнителна верификација${missingFields ? `: ${missingFields}` : ''}${unverifiedFields ? ` (${unverifiedFields})` : ''}.`);
      }
    } catch (verificationError: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(verificationError?.errors?.[0]?.longMessage ?? 'Невалиден код за верификација.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignUp = useCallback(async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setError('');
      setIsGoogleSubmitting(true);

      const { createdSessionId, setActive: setOAuthActive } = await startOAuthFlow();
      if (createdSessionId && setOAuthActive) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await SecureStore.setItemAsync('just_signed_up', 'true');
        await setOAuthActive({ session: createdSessionId });
      }
    } catch (err: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(err?.errors?.[0]?.longMessage ?? 'Регистрацијата со Google не успеа.');
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
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.eyebrow}>ИСКОЧИ</Text>
            <Text style={styles.title}>
              {pendingVerification ? 'Потврди е-маил' : 'Креирај\nсметка'}
            </Text>
            <Text style={styles.subtitle}>
              {pendingVerification
                ? `Внеси го 6-цифрениот код што го испративме на ${email}.`
                : 'Приклучи се и биди во тек со сите настани во градот.'}
            </Text>
          </View>

          <View style={styles.form}>
            {pendingVerification ? (
              <TextInput
                autoCapitalize="none"
                keyboardType="number-pad"
                onChangeText={setCode}
                placeholder="Код за верификација"
                placeholderTextColor="#8F8B89"
                style={styles.input}
                value={code}
              />
            ) : (
              <>
                {/* First and Last Name */}
                <View style={styles.nameRow}>
                  <TextInput
                    autoCapitalize="words"
                    onChangeText={setFirstName}
                    placeholder="Име"
                    placeholderTextColor="#8F8B89"
                    style={[styles.input, styles.nameInput]}
                    value={firstName}
                  />
                  <TextInput
                    autoCapitalize="words"
                    onChangeText={setLastName}
                    placeholder="Презиме"
                    placeholderTextColor="#8F8B89"
                    style={[styles.input, styles.nameInput]}
                    value={lastName}
                  />
                </View>

                {/* Username */}
                <TextInput
                  autoCapitalize="none"
                  autoComplete="username"
                  onChangeText={setUsername}
                  placeholder="Корисничко име (@username)"
                  placeholderTextColor="#8F8B89"
                  style={styles.input}
                  value={username}
                />

                {/* Email */}
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

                {/* Password with Eye toggle */}
                <View style={styles.passwordContainer}>
                  <TextInput
                    autoCapitalize="none"
                    autoComplete="new-password"
                    onChangeText={setPassword}
                    placeholder="Лозинка (минимум 8 знаци)"
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

                {/* Confirm Password with Eye toggle */}
                <View style={styles.passwordContainer}>
                  <TextInput
                    autoCapitalize="none"
                    autoComplete="new-password"
                    onChangeText={setConfirmPassword}
                    placeholder="Потврди ја лозинката"
                    placeholderTextColor="#8F8B89"
                    secureTextEntry={!showConfirmPassword}
                    style={styles.passwordInput}
                    value={confirmPassword}
                  />
                  <Pressable
                    hitSlop={12}
                    onPress={async () => {
                      await Haptics.selectionAsync();
                      setShowConfirmPassword((prev) => !prev);
                    }}
                    style={styles.eyeButton}
                    accessibilityLabel={showConfirmPassword ? 'Скриј лозинка' : 'Прикажи лозинка'}
                  >
                    <Ionicons
                      name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={21}
                      color={showConfirmPassword ? '#63E6DC' : '#8F8B89'}
                    />
                  </Pressable>
                </View>
              </>
            )}

            {error ? <Text style={styles.error}>{error}</Text> : null}

            {/* Submit Button */}
            <Pressable
              disabled={isSubmitting || isGoogleSubmitting}
              onPress={pendingVerification ? handleVerification : handleSignUp}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && { opacity: 0.9, transform: [{ scale: 0.985 }] },
              ]}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#111111" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  {pendingVerification ? 'Потврди е-маил' : 'Креирај сметка'}
                </Text>
              )}
            </Pressable>

            {!pendingVerification && (
              <>
                {/* Divider */}
                <View style={styles.dividerRow}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>или</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Google Sign Up Button */}
                <Pressable
                  disabled={isSubmitting || isGoogleSubmitting}
                  onPress={handleGoogleSignUp}
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
                      <Text style={styles.googleButtonText}>Регистрирај се со Google</Text>
                    </>
                  )}
                </Pressable>
              </>
            )}
          </View>

          <Text style={styles.footerText}>
            Веќе имаш сметка?{' '}
            <Link href="/sign-in" style={styles.link}>
              Најави се
            </Link>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#090C0C' },
  container: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 25,
    paddingTop: 40,
    paddingBottom: 35,
    justifyContent: 'center',
    flexGrow: 1,
  },
  header: { marginBottom: 28 },
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
    lineHeight: 22,
    marginTop: 10,
    fontFamily: 'Wix Madefor Text',
  },
  form: { gap: 13 },
  nameRow: { flexDirection: 'row', gap: 10 },
  nameInput: { flex: 1 },
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
