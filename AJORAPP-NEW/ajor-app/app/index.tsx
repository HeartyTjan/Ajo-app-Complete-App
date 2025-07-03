import { Redirect } from "expo-router";

export default function Index() {
  return <Redirect href="/(auth)/login/login" />;
  // return <Redirect href="/(auth)/signup/signup" />;
  // return <Redirect href="/(tabs)" />;
}
