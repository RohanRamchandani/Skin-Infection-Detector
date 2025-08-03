import React from 'react';
import { router } from 'expo-router';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';

const SkinHealthScanApp = () => {

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Section */}
      <View style={styles.heroContainer}>
        <Text style={styles.heroTitle}>AI-Powered Skin Analysis</Text>
        <Text style={styles.heroSubtitle}>
          Get instant, professional-grade skin condition analysis using advanced AI technology.
        </Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={styles.primaryButton} 
            onPress={() => router.push('/uploadScreen')}
          >
            <Text style={styles.buttonTextPrimary}>Start Analysis</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton}>
            <Text style={styles.buttonTextSecondary}>Learn More</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Features Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Why Choose Our Platform?</Text>
        <Text style={styles.sectionDescription}>
          Combining cutting-edge AI technology with medical expertise to provide you with reliable, fast, and secure skin condition analysis.
        </Text>

        <View style={styles.featureCard}>
          <View style={styles.featureIconContainer}>
            <Text style={styles.featureIcon}>🔍</Text>
          </View>
          <View style={styles.featureTextContainer}>
            <Text style={styles.featureTitle}>AI-Powered Analysis</Text>
            <Text style={styles.featureDescription}>
              Advanced machine learning algorithms analyze your skin images with medical-grade accuracy.
            </Text>
          </View>
        </View>

        <View style={styles.featureCard}>
          <View style={styles.featureIconContainer}>
            <Text style={styles.featureIcon}>💡</Text>
          </View>
          <View style={styles.featureTextContainer}>
            <Text style={styles.featureTitle}>Professional Recommendations</Text>
            <Text style={styles.featureDescription}>
              Get evidence-based treatment recommendations and guidance.
            </Text>
          </View>
        </View>
      </View>

      {/* How It Works Section */}
      <View style={[styles.section, styles.lightBackground]}>
        <Text style={styles.sectionTitle}>How It Works</Text>
        <Text style={styles.sectionDescription}>
          Get professional-grade skin analysis in three simple steps.
        </Text>

        <View style={styles.stepsContainer}>
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Upload Image</Text>
              <Text style={styles.stepDescription}>
                Take a clear photo of the affected skin area and upload it securely.
              </Text>
            </View>
          </View>

          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>AI Analysis</Text>
              <Text style={styles.stepDescription}>
                Our advanced AI analyzes your image using trained medical datasets.
              </Text>
            </View>
          </View>

          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Get Results</Text>
              <Text style={styles.stepDescription}>
                Receive detailed analysis with professional recommendations.
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.primaryButton} 
          onPress={() => router.push('/uploadScreen')}
        >
          <Text style={styles.buttonTextPrimary}>Get Started Now</Text>
        </TouchableOpacity>
      </View>

      {/* CTA Section */}
      <View style={[styles.section, styles.ctaSection]}>
        <Text style={styles.ctaTitle}>Take Control of Your Skin Health Today</Text>
        <Text style={styles.ctaDescription}>
          Don't wait - early detection and proper care can make all the difference.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  heroContainer: {
    padding: 28,
    alignItems: 'center',
    backgroundColor: '#0f172a',
    paddingBottom: 48,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#38bdf8',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'System',
  },
  heroSubtitle: {
    fontSize: 18,
    color: '#e2e8f0',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 26,
    fontFamily: 'System',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    width: '100%',
  },
  primaryButton: {
    backgroundColor: '#38bdf8',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    minWidth: 160,
    alignItems: 'center',
    shadowColor: '#38bdf8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#38bdf8',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    minWidth: 160,
    alignItems: 'center',
  },
  buttonTextPrimary: {
    color: '#0f172a',
    fontWeight: '700',
    fontSize: 16,
  },
  buttonTextSecondary: {
    color: '#38bdf8',
    fontWeight: '600',
    fontSize: 16,
  },
  section: {
    padding: 28,
    backgroundColor: 'white',
  },
  lightBackground: {
    backgroundColor: '#e2e8f0',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 16,
  },
  sectionDescription: {
    fontSize: 16,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 24,
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  featureIconContainer: {
    marginRight: 18,
  },
  featureIcon: {
    fontSize: 26,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 6,
  },
  featureDescription: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  stepsContainer: {
    marginBottom: 32,
  },
  step: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  stepNumber: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#38bdf8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepNumberText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  ctaSection: {
    backgroundColor: '#0ea5e9',
    alignItems: 'center',
    paddingVertical: 42,
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#f1f5f9',
    textAlign: 'center',
    marginBottom: 12,
  },
  ctaDescription: {
    fontSize: 16,
    color: '#f8fafc',
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 24,
  },
});

export default SkinHealthScanApp;