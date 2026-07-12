import { Redirect, useLocalSearchParams } from 'expo-router';

export default function LegacyGameRedirect() {
  const params = useLocalSearchParams();
  return (
    <Redirect
      href={{
        pathname: '/games/word-hunt/play',
        params,
      }}
    />
  );
}
