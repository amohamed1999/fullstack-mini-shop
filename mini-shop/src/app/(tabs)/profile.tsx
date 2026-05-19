import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/store/authSlice";
import { Ionicons } from "@expo/vector-icons";
import { useRegisterMutation } from "@/services/productsApi";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";

export default function ProfileScreen() {
const userdatas = useSelector(
  (state: any) => state.auth.user
);

  const dispatch = useDispatch();
const router = useRouter();
  const [registerUser, { isLoading , data:userdata }] =
    useRegisterMutation();


   const handleLogout = async () => {
  await SecureStore.deleteItemAsync("accessToken");
  await SecureStore.deleteItemAsync("refreshToken");


  dispatch(logout());
  router.replace("/(auth)/login");
};
  return (
    <>
      <StatusBar barStyle="light-content" />

      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color="#fff" />
          </View>

          <Text style={styles.name}>{userdatas?.name ?? "Guest"}</Text>

          <Text style={styles.email}>{userdatas?.email ?? "No email"}</Text>

          <TouchableOpacity style={styles.button} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#fff" />

            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:"#0F0F14"
  },

  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#7C3AED",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },

  name: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 10,
  },

  email: {
    color: "#A1A1AA",
    fontSize: 16,
    marginBottom: 40,
  },

  button: {
    width: "100%",
    height: 60,
    borderRadius: 20,
    backgroundColor: "#7C3AED",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },

  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    marginLeft: 10,
  },
});