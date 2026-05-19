import { store } from "@/store/store";
import { Stack } from "expo-router";
import { Provider } from "react-redux";
import AuthProvider from "@/app/providers/AuthProvider";


export default function Layout() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
      </AuthProvider>
    </Provider>
  );
}