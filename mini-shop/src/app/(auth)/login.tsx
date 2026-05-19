import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  ScrollView,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/store/authSlice";
import { useLoginMutation } from "@/services/productsApi";
import { Link, useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { LinearGradient } from "expo-linear-gradient";
import { Mail, Lock } from "lucide-react-native";
import { setToken } from "../tokenHleper";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginFormData, loginSchema } from "../schemas/authSchema";

type FormData = {
  email: string;
  password: string;
};

export default function LoginScreen() {
  const [login, { isLoading }] = useLoginMutation();
  const router = useRouter();
  const dispatch = useDispatch();
  const {
  control,
  handleSubmit,
  formState: { errors },
} = useForm<LoginFormData>({
  resolver: zodResolver(loginSchema),
});

const onSubmit = async (data: FormData) => {
  try {
    const res = await login(data).unwrap();

    const token = res.data.accessToken;
    const refreshToken = res.data.refreshToken;
    const user = res.data.user;


    setToken(token);

    await SecureStore.setItemAsync(
      "accessToken",
      token
    );

    await SecureStore.setItemAsync(
      "refreshToken",
      refreshToken
    );

    // redux
    dispatch(
      setCredentials({
        token,
        user,
      })
    );

    router.replace("/(tabs)");

  } catch (error) {
    console.log("LOGIN ERROR:", error);
  }
};

  return (
<>
  <StatusBar barStyle="light-content" />

  <LinearGradient
    colors={["#0F0F14", "#171721", "#0F0F14"]}
    style={styles.container}
  >
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : "height"
      }
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          paddingHorizontal: 24,
          paddingBottom: 120,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>
            Welcome Back 👋
          </Text>

          <Text style={styles.subtitle}>
            Login to continue shopping with
            the best experience.
          </Text>
        </View>

        {/* EMAIL */}

        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Email Address
          </Text>

          <View style={styles.inputWrapper}>
            <Mail color="#A1A1AA" size={22} />

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  placeholder="example@email.com"
                  placeholderTextColor="#71717A"
                  keyboardType="email-address"
                  value={value}
                  onChangeText={onChange}
                  style={styles.input}
                />
              )}
            />
          </View>

          {errors.email?.message && (
  <Text style={styles.error}>
    {errors.email.message}
  </Text>
)}
        </View>

        {/* PASSWORD */}

        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Password
          </Text>

          <View style={styles.inputWrapper}>
            <Lock color="#A1A1AA" size={22} />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  placeholder="••••••••"
                  placeholderTextColor="#71717A"
                  secureTextEntry
                  value={value}
                  onChangeText={onChange}
                  style={styles.input}
                />
              )}
            />
          </View>

          {errors.password && (
            <Text style={styles.error}>
              {errors.password.message}
            </Text>
          )}
        </View>

        <Link href="/forgot-password" asChild>
          <TouchableOpacity style={styles.forgotButton}>
            <Text style={styles.forgotText}>
              Forgot Password?
            </Text>
          </TouchableOpacity>
        </Link>

        {/* BUTTON */}

        <TouchableOpacity
          disabled={isLoading}
          style={[
            styles.loginButton,
            isLoading && { opacity: 0.6 },
          ]}
          onPress={handleSubmit(onSubmit)}
        >
          <Text style={styles.loginButtonText}>
            {isLoading ? "Loading..." : "Login"}
          </Text>
        </TouchableOpacity>

        {/* FOOTER */}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Don’t have an account?
          </Text>

          <Link href="/register" asChild>
            <TouchableOpacity>
              <Text style={styles.registerText}>
                Register
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  </LinearGradient>
</>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  wrapper: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  header: {
    marginBottom: 50,
  },

  title: {
    color: "#fff",
    fontSize: 42,
    fontWeight: "700",
    marginBottom: 14,
  },

  subtitle: {
    color: "#A1A1AA",
    fontSize: 16,
    lineHeight: 28,
  },

  inputContainer: {
    marginBottom: 22,
  },

  label: {
    color: "#E4E4E7",
    marginBottom: 12,
    fontSize: 15,
    fontWeight: "500",
  },

  inputWrapper: {
    backgroundColor: "#1E1E2A",
    height: 62,
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: "#27272A",
  },

  input: {
    flex: 1,
    color: "#fff",
    marginLeft: 12,
    fontSize: 16,
  },

  error: {
    color: "#EF4444",
    marginTop: 8,
    fontSize: 13,
  },

  forgotButton: {
    marginBottom: 34,
  },

  forgotText: {
    color: "#8B5CF6",
    textAlign: "right",
    fontWeight: "600",
  },

  loginButton: {
    height: 62,
    backgroundColor: "#7C3AED",
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },

  loginButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },

  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 35,
  },

  footerText: {
    color: "#A1A1AA",
    fontSize: 15,
  },

  registerText: {
    color: "#8B5CF6",
    marginLeft: 6,
    fontWeight: "700",
    fontSize: 15,
  },
});