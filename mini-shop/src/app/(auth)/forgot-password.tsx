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
  Alert,
} from "react-native";
import { useForgotPasswordMutation } from "@/services/productsApi";
import { Link } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { LinearGradient } from "expo-linear-gradient";
import { Mail, ArrowLeft } from "lucide-react-native";

type FormData = {
  email: string;
};

export default function ForgotPasswordScreen() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const [forgotPassword, { isLoading }] =
  useForgotPasswordMutation();

const onSubmit = async (data: FormData) => {
  try {
    const res = await forgotPassword(data).unwrap();

    Alert.alert(
      "Success",
      res.message || "Reset link sent successfully"
    );
  } catch (error) {
    console.log("FORGOT PASSWORD ERROR:", error);

    Alert.alert(
      "Error",
      "Something went wrong. Try again."
    );
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
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.wrapper}
        >
          {/* BACK BUTTON */}

          <Link href="/login" asChild>
            <TouchableOpacity style={styles.backButton}>
              <ArrowLeft color="#FFFFFF" size={24} />
            </TouchableOpacity>
          </Link>

          {/* HEADER */}

          <View style={styles.header}>
            <Text style={styles.title}>
              Forgot Password 🔐
            </Text>

            <Text style={styles.subtitle}>
              Don’t worry. Enter your email
              address and we’ll send you a
              password reset link.
            </Text>
          </View>

          {/* EMAIL INPUT */}

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
                    autoCapitalize="none"
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

          {/* BUTTON */}

  <TouchableOpacity
  disabled={isLoading}
  style={[
    styles.button,
    isLoading && { opacity: 0.6 }
  ]}
  onPress={handleSubmit(onSubmit)}
>
  <Text style={styles.buttonText}>
    {isLoading ? "Sending..." : "Send Reset Link"}
  </Text>
</TouchableOpacity>

          {/* FOOTER */}

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Remember your password?
            </Text>

            <Link href="/login" asChild>
              <TouchableOpacity>
                <Text style={styles.loginText}>
                  Login
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
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

  backButton: {
    position: "absolute",
    top: 70,
    left: 24,
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#1E1E2A",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#27272A",
  },

  header: {
    marginBottom: 50,
  },

  title: {
    color: "#FFFFFF",
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
    marginBottom: 30,
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
    color: "#FFFFFF",
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
  },

  buttonText: {
    color: "#FFFFFF",
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

  loginText: {
    color: "#8B5CF6",
    marginLeft: 6,
    fontWeight: "700",
    fontSize: 15,
  },
});