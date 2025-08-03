import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function App() {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions to select an image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setResult(null);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera permissions to take a photo.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setResult(null);
    }
  };

  const analyzeImage = async () => {
    if (!image) {
      Alert.alert('No Image', 'Please select or take a photo first.');
      return;
    }

    setLoading(true);
    try {
      // For now, we'll simulate the analysis
      // In a real app, you'd upload the image to your backend
      setTimeout(() => {
        setResult({
          disease: 'Eczema',
          confidence: '85%',
          supplements: [
            'Omega-3 fatty acids (fish oil)',
            'Vitamin D3 (1000-2000 IU daily)',
            'Probiotics (Lactobacillus strains)',
            'Zinc (15-30mg daily)',
            'Evening primrose oil'
          ],
          healthyFoods: [
            'Fatty fish (salmon, mackerel, sardines)',
            'Leafy green vegetables',
            'Berries (blueberries, strawberries)',
            'Nuts and seeds (almonds, walnuts, flaxseeds)',
            'Avocados and olive oil'
          ],
          foodsToAvoid: [
            'Dairy products (milk, cheese, yogurt)',
            'Gluten-containing foods',
            'Processed foods and refined sugars',
            'Nightshade vegetables (tomatoes, peppers)',
            'Shellfish and certain nuts'
          ],
          allergyInfo: [
            'Common triggers: dust mites, pet dander, pollen',
            'Avoid harsh soaps and detergents',
            'Use fragrance-free products',
            'Keep skin moisturized with hypoallergenic creams',
            'Consider allergy testing for specific triggers'
          ]
        });
        setLoading(false);
      }, 2000);
    } catch (error) {
      Alert.alert('Error', 'Failed to analyze image. Please try again.');
      setLoading(false);
    }
  };

  const resetApp = () => {
    setImage(null);
    setResult(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>🧠 Skin Infection Detector</Text>
        <Text style={styles.subtitle}>AI-Powered Skin Disease Detection</Text>

        {!image && !result && (
          <View style={styles.uploadSection}>
            <Text style={styles.sectionTitle}>Upload or Take a Photo</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={pickImage}>
                <Text style={styles.buttonText}>📁 Choose from Gallery</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={takePhoto}>
                <Text style={styles.buttonText}>📷 Take Photo</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {image && (
          <View style={styles.imageSection}>
            <Text style={styles.sectionTitle}>Selected Image</Text>
            <Image source={{ uri: image }} style={styles.image} />
            <TouchableOpacity style={styles.analyzeButton} onPress={analyzeImage}>
              <Text style={styles.analyzeButtonText}>
                🔍 Analyze Image
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {loading && (
          <View style={styles.loadingSection}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Analyzing image...</Text>
          </View>
        )}

        {result && (
          <View style={styles.resultSection}>
            <Text style={styles.sectionTitle}>Analysis Results</Text>
            <View style={styles.resultCard}>
              <Text style={styles.diseaseText}>Detected: {result.disease}</Text>
              <Text style={styles.confidenceText}>Confidence: {result.confidence}</Text>
              
              <Text style={styles.subsectionTitle}>💊 Supplements:</Text>
              {result.supplements.map((supplement, index) => (
                <Text key={index} style={styles.recommendation}>
                  • {supplement}
                </Text>
              ))}
              
              <Text style={styles.subsectionTitle}>🥗 Healthy Foods:</Text>
              {result.healthyFoods.map((food, index) => (
                <Text key={index} style={styles.recommendation}>
                  • {food}
                </Text>
              ))}
              
              <Text style={styles.subsectionTitle}>❌ Foods to Avoid:</Text>
              {result.foodsToAvoid.map((food, index) => (
                <Text key={index} style={styles.recommendation}>
                  • {food}
                </Text>
              ))}
              
              <Text style={styles.subsectionTitle}>⚠️ Allergy Information:</Text>
              {result.allergyInfo.map((info, index) => (
                <Text key={index} style={styles.recommendation}>
                  • {info}
                </Text>
              ))}
            </View>
          </View>
        )}

        {(image || result) && (
          <TouchableOpacity style={styles.resetButton} onPress={resetApp}>
            <Text style={styles.resetButtonText}>🔄 Start Over</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  uploadSection: {
    width: '100%',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    color: '#333',
  },
  buttonContainer: {
    width: '100%',
    gap: 15,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  imageSection: {
    width: '100%',
    alignItems: 'center',
  },
  image: {
    width: 250,
    height: 250,
    borderRadius: 15,
    marginBottom: 20,
  },
  analyzeButton: {
    backgroundColor: '#34C759',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  analyzeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingSection: {
    alignItems: 'center',
    marginTop: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  resultSection: {
    width: '100%',
    marginTop: 20,
  },
  resultCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  diseaseText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  confidenceText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  recommendationsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 15,
    marginBottom: 8,
  },
  recommendation: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
    lineHeight: 20,
  },
  resetButton: {
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  resetButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 