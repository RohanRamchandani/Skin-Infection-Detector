import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { NavigationProp } from '@react-navigation/native';

// Define your backend URL in one place for easy updates.
const API_BASE_URL = 'http://4.157.173.143:8000'; // Ensure this is correct

const UploadScreen = ({ navigation }: { navigation: NavigationProp<any> }) => {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allergyInput, setAllergyInput] = useState('');
  const router = useRouter();

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri);
      setError(null);
    }
  };

  const takePhoto = async () => {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    setError('Camera access is required to take photos.');
    return;
  }

  let result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect: [4, 3],
    quality: 1,
  });

  if (!result.canceled && result.assets && result.assets.length > 0) {
    setImage(result.assets[0].uri);
    setError(null);
  }
};

  const uploadImage = async (imageUri: string) => {
    try {
      const filename = imageUri.split('/').pop() || `image-${Date.now()}.jpg`;
      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        name: filename,
        type: 'image/jpeg',
      } as any);

      // Use API_BASE_URL for consistency, assuming the /upload endpoint is on the same base.
      // If your upload endpoint is truly on a different base URL (e.g., 4.157.173.143),
      // you should define that as a separate constant.
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${errorText}`);
      }

      return await response.json();
    } catch (e) {
      console.error('Upload error:', e);
      throw e;
    }
  };

  // Modified to use statusUrl instead of taskId
const getResultAfterDelay = async (statusUrl: string) => {
  const WAIT_TIME_MS = 10000; // 10 seconds

  await new Promise(resolve => setTimeout(resolve, WAIT_TIME_MS));

  try {
    const response = await fetch(`${API_BASE_URL}${statusUrl}`);
    const data = await response.json();

    if (data.status === 'completed') {
      console.log('Analysis complete:', data.prediction);
      return {
  diagnosis: data.prediction,
  confidence: data.confidence,
  full_output: data.full_output,
};

    } else if (data.status === 'failed') {
      throw new Error(data.error || 'Analysis failed on the server.');
    } else {
      throw new Error(`Task status: ${data.status}. Try again later.`);
    }
  } catch (e) {
    console.error('GET result error:', e);
    throw e;
  }
};


const handleAnalyzePress = async () => {
  if (!image) {
    setError('Please select an image first.');
    return;
  }

  setIsAnalyzing(true);
  setError(null);

  try {
    // 1️⃣ Upload the image
    const uploadResponse = await uploadImage(image);

    if (!uploadResponse.success || !uploadResponse.status_url) {
      throw new Error('Backend did not return a valid status URL.');
    }

    console.log(`Upload successful. Status URL: ${uploadResponse.status_url}`);

    // 2️⃣ Wait & then GET the result



    const fetchRecommendations = async (skin_disease: string, allergies: string[]) => {
  try {
    const response = await fetch(`${API_BASE_URL}/recommend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        skin_disease,
        allergies,
      }),
    });

    const data = await response.json();
    return data;
  } catch (e) {
    console.error('Recommendation fetch error:', e);
    return { error: 'Failed to get recommendations' };
  }
};

      const result = await getResultAfterDelay(uploadResponse.status_url);
const allergyList = allergyInput.split(',').map(a => a.trim()).filter(Boolean);
const recommendations = await fetchRecommendations(result.diagnosis, allergyList);

    console.log('Analysis result:', JSON.stringify(result));
    // ✅ Navigate to results screen
router.push({
  pathname: 'resultsScreen',
  params: {
    result: JSON.stringify(result),
    allergies: allergyInput,  // ✅ add this
  },
});



  } catch (e: any) {
    setError(e.message || 'An unknown error occurred.');
  } finally {
    setIsAnalyzing(false);
  }
};
  return (
    <ScrollView>
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color="#1e293b" />
          <Text style={styles.backText}>Back to Home</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Upload Your Skin Image</Text>
          <Text style={styles.subtitle}>
            Our AI-powered system will analyze your skin condition and provide
            professional recommendations.
          </Text>
        </View>

        <View style={styles.uploadSection}>
          <Text style={styles.sectionTitle}>Select or Drop Image</Text>

          <TouchableOpacity
            style={styles.uploadBox}
            onPress={pickImage}
          >
            {image ? (
              <Image source={{ uri: image }} style={styles.imagePreview} />
            ) : (
              <>
                <Ionicons name="cloud-upload-outline" size={48} color="#38bdf8" />
                <Text style={styles.uploadText}>
                  Drop your image here, or click to browse
                </Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.supportText}>
            Supports JPG, PNG, and other image formats
          </Text>

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
              <Text style={styles.uploadButtonText}>Choose File</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.uploadButton, { backgroundColor: '#10b981' }]}
              onPress={takePhoto}
            >
              <Text style={styles.uploadButtonText}>Open Camera</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Allergy Input Section */}
        <View style={styles.allergyInputContainer}>
          <Text style={styles.allergyInputLabel}>Enter any known allergies (comma-separated):</Text>
          <TextInput
            style={styles.allergyTextInput}
            value={allergyInput}
            onChangeText={setAllergyInput}
            placeholder="e.g., peanuts, dairy, gluten"
            placeholderTextColor="#94a3b8"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.guidelines}>
          <Text style={styles.guidelinesTitle}>Important Guidelines:</Text>
          <View style={styles.guidelineItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.guidelineText}>
              Ensure the image is clear and well-lit
            </Text>
          </View>
          <View style={styles.guidelineItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.guidelineText}>
              Take the photo directly above the affected area
            </Text>
          </View>
          <View style={styles.guidelineItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.guidelineText}>Avoid shadows and reflections</Text>
          </View>
          <View style={styles.guidelineItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.guidelineText}>
              Include a ruler or coin for size reference if possible
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleAnalyzePress}
          style={[styles.analyzeButton, isAnalyzing && styles.disabledButton]}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? (
            <>
              <ActivityIndicator size="small" color="#38bdf8" />
              <Text style={styles.analyzeButtonText}>Analyzing...</Text>
            </>
          ) : (
            <Text style={styles.analyzeButtonText}>Analyze Image</Text>
          )}
        </TouchableOpacity>

        {error && (
          <View style={styles.resultBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 24,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 12,
  },
  backText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
  },
  uploadSection: {
    marginBottom: 32,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 16,
    textAlign: 'center',
  },
  uploadBox: {
    width: '100%',
    minHeight: 400,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    marginBottom: 16,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    resizeMode: 'contain',
  },
  uploadText: {
    fontSize: 16,
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  supportText: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 16,
  },
  uploadButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  uploadButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  allergyInputContainer: {
    width: '100%',
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  allergyInputLabel: {
    fontSize: 16,
    color: '#334155',
    marginBottom: 8,
    fontWeight: '500',
  },
  allergyTextInput: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1e293b',
    backgroundColor: '#fefefe',
  },
  guidelines: {
    backgroundColor: '#e0f2fe',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  guidelinesTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 16,
  },
  guidelineItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  bullet: {
    fontSize: 16,
    color: '#334155',
    marginRight: 8,
    lineHeight: 22,
  },
  guidelineText: {
    flex: 1,
    fontSize: 16,
    color: '#334155',
    lineHeight: 22,
  },
  analyzeButton: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    gap: 10,
  },
  analyzeButtonText: {
    color: '#38bdf8',
    fontWeight: '700',
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: '#334155',
  },
  resultBox: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  errorText: {
    fontSize: 14,
    color: '#dc2626',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default UploadScreen;
