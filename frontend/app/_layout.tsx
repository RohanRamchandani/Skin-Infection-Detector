import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          headerShown: false,
          title: 'Skin Health Scan' 
        }} 
      />
      <Stack.Screen 
        name="uploadScreen" 
        options={{ 
          headerShown: false,
          title: 'Upload Image' 
        }} 
      />
      <Stack.Screen
        name="resultScreen"
        options={{
          headerShown: false,
          title: 'Results',
        }}
        />
    </Stack>
  );
}