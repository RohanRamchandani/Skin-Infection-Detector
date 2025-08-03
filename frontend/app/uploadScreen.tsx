import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { NavigationProp } from '@react-navigation/native';

const UploadScreen = ({ navigation }: { navigation: NavigationProp<any> }) => {
  const [image, setImage] = useState<string | null>(null);
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
    }
  };

   const uploadImage = async (image) => {
    let filename = image.split('/').pop();
    let match = /\.(\w+)$/.exec(filename);
    let type = match ? `image/${match[1]}` : `image/jpeg`;

    if(!match){
      filename = `$(filename).jpg`;
    }
    let formData = new FormData();
    formData.append('image', {
      uri: image,
      name: filename,
      type: type,
    } as any);

      try {
      const response = await fetch('http://10.17.145.120:5000/upload', {
        method: 'POST',
        body: formData,
      });
      console.log('Status code:', response.status);
      const data = await response.json();
      

  
      console.log(data);
      return data;
    } catch (error) {
      console.error(error);
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
          Our AI-powered system will analyze your skin condition and provide professional recommendations.
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
        
        <Text style={styles.supportText}>Supports JPG, PNG, and other image formats</Text>
        
              <View style={{ flexDirection: 'row', gap: 12 }}>
        <TouchableOpacity 
          style={styles.uploadButton}
          onPress={pickImage}
        >
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
          <Text style={styles.guidelineText}>Ensure the image is clear and well-lit</Text>
        </View>
        <View style={styles.guidelineItem}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.guidelineText}>Take the photo directly above the affected area</Text>
        </View>
        <View style={styles.guidelineItem}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.guidelineText}>Avoid shadows and reflections</Text>
        </View>
        <View style={styles.guidelineItem}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.guidelineText}>Include a ruler or coin for size reference if possible</Text>
        </View>
      </View>

      <TouchableOpacity onPress={async () => {
        if (image) {
          const result = await uploadImage(image);
          console.log('Backend response:', result);
          // Optionally navigate:

        } else {
          // Optionally show a message to select an image first
          console.log('Please select an image before analyzing.');
        }
      }} style={styles.analyzeButton}>
        <Text style={styles.analyzeButtonText}>Analyze Image</Text>
      </TouchableOpacity>
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
    minHeight: 400, // was 200
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  analyzeButtonText: {
    color: '#38bdf8',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default UploadScreen;