// Auth group index — redirects to the phone screen.
import { Redirect } from 'expo-router';

export default function AuthIndex() {
  return <Redirect href="/(auth)/phone" />;
}
