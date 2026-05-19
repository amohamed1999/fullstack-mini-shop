import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
} from "react-native";
import { zodResolver } from "@hookform/resolvers/zod";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";

import { useRegisterMutation } from "@/services/productsApi";

import { Link } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { LinearGradient } from "expo-linear-gradient";
import {
  User,
  Mail,
  Lock,
} from "lucide-react-native";
import { RegisterFormData, registerSchema } from "../schemas/authSchema";
import { setCredentials } from "@/store/authSlice";
import { useDispatch } from "react-redux";
import { setToken } from "../tokenHleper";


export default function RegisterScreen() {
  let router = useRouter()
  let dispatch = useDispatch()
  
  const {
  control,
  handleSubmit,
  formState: { errors },
} = useForm<RegisterFormData>({
  resolver: zodResolver(registerSchema),
});

const [registerUser, { isLoading }] =
  useRegisterMutation();



const onSubmit = async (data: RegisterFormData) => {
  try {
    const response = await registerUser(data).unwrap();

    console.log("userssss" , response)
    const token = response.data.accessToken;

   
    await SecureStore.setItemAsync("accessToken", token);
    await SecureStore.setItemAsync("refreshToken", response.data.refreshToken);

  
    setToken(token);

    dispatch(
  setCredentials({
    token,
    user: {
      id: response.data.user.id,
      name: response.data.user.name,
      email: data.email,
      role: response.data.user.role,
    },
  })
);

    router.replace("/(tabs)");

  } catch (error) {
    console.log(error);
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
          contentContainerStyle={styles.scrollContainer}
           keyboardShouldPersistTaps="handled"
           showsVerticalScrollIndicator={false}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <View style={styles.header}>
              <Text style={styles.title}>
                Create Account ✨
              </Text>

              <Text style={styles.subtitle}>
                Register now and enjoy
                premium shopping experience.
              </Text>
            </View>

            {/* NAME */}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                Full Name
              </Text>

              <View style={styles.inputWrapper}>
                <User color="#A1A1AA" size={22} />

                <Controller
                  control={control}
                  name="name"
                  rules={{
                    required: "Name is required",
                  }}
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      placeholder="Mohamed Nageh"
                      placeholderTextColor="#71717A"
                      value={value}
                      onChangeText={onChange}
                      style={styles.input}
                    />
                  )}
                />
              </View>

              {errors.name && (
                <Text style={styles.error}>
                  {errors.name.message}
                </Text>
              )}
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
                  rules={{
                    required: "Email is required",
                  }}
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

              {errors.email && (
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
                  rules={{
                    required: "Password is required",
                  }}
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

            {/* BUTTON */}

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.button}
              onPress={handleSubmit(onSubmit)}
            >
              <Text style={styles.buttonText}>
                Create Account
              </Text>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Already have an account?
              </Text>

              <Link href="/login" asChild>
                <TouchableOpacity>
                 <Text style={styles.buttonText}>
  {isLoading
    ? "Creating..."
    : "Create Account"}
</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </KeyboardAvoidingView>
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

  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
    paddingBottom: 120,
  },

  header: {
    marginBottom: 50,
  },

  title: {
    color: "#fff",
    fontSize: 40,
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

  button: {
    height: 62,
    backgroundColor: "#7C3AED",
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },

  buttonText: {
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
  },

  linkText: {
    color: "#8B5CF6",
    marginLeft: 6,
    fontWeight: "700",
  },
});