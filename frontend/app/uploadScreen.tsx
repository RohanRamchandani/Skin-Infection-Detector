import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { NavigationProp } from '@react-navigation/native';

// Define your backend URL in one place for easy updates.
// Replace with your computer's IP or 10.0.2.2 for Android emulator.
const API_BASE_URL = 'http://10.17.145.120:5000';

const UploadScreen = ({ navigation }: { navigation: NavigationProp<any> }) => {
  const [image, setImage] = useState<string | null>(null);
  // State to manage the analysis process UI
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
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
      // Clear previous results when a new image is selected
      setAnalysisResult(null);
      setError(null);
    }
  };

  const takePhoto = async () => {
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri);
      // Clear previous results when a new image is selected
      setAnalysisResult(null);
      setError(null);
    }
  };

  const uploadImage = async (imageUri: string) => {
    // This function now only handles the initial upload.
    try {
      const filename = imageUri.split('/').pop() || `image-${Date.now()}.jpg`;
      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        name: filename,
        type: 'image/jpeg',
      } as any);

      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${errorText}`);
      }

      // The backend now returns a task_id
      return await response.json();
    } catch (e) {
      console.error('Upload error:', e);
      throw e; // Re-throw to be caught by the main handler
    }
  };

  // New function to poll for the analysis result
  const pollForResult = async (taskId: string) => {
    const MAX_ATTEMPTS = 30; // Poll for a maximum of 1 minute (20 * 3s)
    const POLL_INTERVAL = 3000; // 3 seconds

    for (let i = 0; i < MAX_ATTEMPTS; i++) {
      try {
        await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL)); // Wait

        const response = await fetch(`${API_BASE_URL}/result/${taskId}`);
        const data = await response.json();

        if (data.status === 'completed') {
          console.log('Analysis complete:', data.prediction);
          return data.prediction; // Success! Return the result.
        } else if (data.status === 'failed') {
          throw new Error(data.error || 'Analysis failed on the server.');
        }
        // If status is 'processing' or 'not_found', the loop will continue.
        console.log(`Attempt ${i + 1}: Status is '${data.status}'. Polling again...`);
      } catch (e) {
        console.error('Polling error:', e);
        throw e;
      }
    }

    throw new Error('Analysis timed out. Please try again.');
  };

  // New main handler to orchestrate the upload and polling flow
  const handleAnalyzePress = async () => {
    if (!image) {
      setError('Please select an image first.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);

    try {
      // Step 1: Upload the image to get a task ID
      const uploadResponse = await uploadImage(image);
      if (!uploadResponse.success || !uploadResponse.task_id) {
        throw new Error('Backend did not return a valid task ID.');
      }

      console.log(`Upload successful. Task ID: ${uploadResponse.task_id}`);

      // Step 2: Poll for the result using the task ID
      const result = await pollForResult(uploadResponse.task_id);
      router.push({
        pathname: 'resultsScreen',
        params: {result: JSON.stringify(result)},
      }); // Set the final result to the state
    } catch (e: any) {
      setError(e.message || 'An unknown error occurred.');
    } finally {
      setIsAnalyzing(false); // Stop the loading indicator
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
        {analysisResult && (
          <View style={styles.resultBox}>
            <Text style={styles.resultTitle}>Analysis Result:</Text>
            <Text style={styles.resultText}>
              {JSON.stringify(analysisResult, null, 2)}
            </Text>
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
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 8,
  },
  resultText: {
    fontSize: 14,
    color: '#334155',
    fontFamily: 'monospace',
  },
  errorText: {
    fontSize: 14,
    color: '#dc2626',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default UploadScreen;