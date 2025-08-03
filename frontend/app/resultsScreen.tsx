import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function ResultsScreen() {
  const { result } = useLocalSearchParams();
  const router = useRouter();

  const parsedResult = result ? JSON.parse(result as string) : null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Analysis Result</Text>
      <Text style={styles.result}>{JSON.stringify(parsedResult, null, 2)}</Text>

      <Text
        style={styles.backLink}
        onPress={() => router.back()}
      >
        Back
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  result: {
    fontFamily: 'monospace',
    fontSize: 14,
    color: '#334155',
  },
  backLink: {
    marginTop: 24,
    color: '#3b82f6',
    textDecorationLine: 'underline',
  },
});
