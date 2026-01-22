// app/(auth)/_layout.tsx

import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#2563EB" },
        animation: "fade",
      }}
    >
      <Stack.Screen
        name="login"
        options={{
          title: "Login",
          animation: "fade",
        }}
      />
      <Stack.Screen
        name="register"
        options={{
          title: "Register",
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen
        name="forgot-password"
        options={{
          title: "Forgot Password",
          animation: "slide_from_right",
        }}
      />
    </Stack>
  );
}
