import React from 'react'; // Removed useState, useEffect as they are not needed for static mock data
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ResultsScreen() {
  const { result } = useLocalSearchParams();
  const router = useRouter();

  // Safely parse the initial image analysis result (still useful for displaying detected condition)
  let parsedImageAnalysisResult = null;
  if (typeof result === 'string') {
    try {
      parsedImageAnalysisResult = JSON.parse(decodeURIComponent(result));
    } catch (e) {
      console.error("Failed to parse image analysis result JSON:", e);
    }
  } else if (Array.isArray(result) && result.length > 0 && typeof result[0] === 'string') {
    try {
      parsedImageAnalysisResult = JSON.parse(decodeURIComponent(result[0]));
    } catch (e) {
      console.error("Failed to parse image analysis result JSON from array:", e);
    }
  }

  // Extract skin condition from the image analysis result
  const skinConditionFromImage = parsedImageAnalysisResult?.skinCondition || 'Unknown';

  // Mock data for demonstration
  const recommendationData = {
    condition: skinConditionFromImage, // Use the detected condition for the mock data's condition
    foods_to_avoid: [
      "Highly processed foods",
      "Foods high in saturated and trans fats",
      "Foods high in sugar",
      "Common allergens like dairy, gluten, soy (if applicable to a specific condition)",
      "Spicy foods (can trigger redness in some conditions)",
    ],
    healthy_foods: [
      {
        name: "Fatty Fish (salmon, mackerel, tuna)",
        benefit: "Excellent source of omega-3 fatty acids, which have anti-inflammatory effects beneficial for skin health.",
        nutrients: "Omega-3 fatty acids (EPA and DHA), Vitamin D"
      },
      {
        name: "Avocados",
        benefit: "Rich in healthy fats and antioxidants that contribute to skin hydration and overall health.",
        nutrients: "Monounsaturated fats, Vitamin E, antioxidants"
      },
      {
        name: "Berries (blueberries, strawberries)",
        benefit: "Packed with antioxidants that protect skin cells from damage.",
        nutrients: "Vitamin C, various antioxidants"
      },
      {
        name: "Leafy Greens (spinach, kale)",
        benefit: "Good source of vitamins, minerals, and antioxidants essential for skin repair and protection.",
        nutrients: "Vitamins A, C, K, folate, iron"
      },
      {
        name: "Nuts & Seeds (almonds, chia seeds)",
        benefit: "Provide healthy fats, zinc, and selenium which are crucial for skin integrity and healing.",
        nutrients: "Omega-3s, Zinc, Selenium, Vitamin E"
      },
      {
        name: "Sweet Potatoes",
        benefit: "Good source of beta-carotene, a precursor to vitamin A, essential for skin health and barrier function.",
        nutrients: "Beta-carotene (Vitamin A precursor), Vitamin C"
      },
    ],
    supplements: [
      {
        name: "Omega-3 Fatty Acids (EPA and DHA)",
        benefit: "Reduces inflammation, which is a common factor in many skin conditions. May improve skin barrier function.",
        dosage: "Consult a doctor for appropriate dosage, typically 1-4g daily."
      },
      {
        name: "Vitamin D",
        benefit: "Plays a role in immune regulation and skin health. Deficiency is linked to increased severity of certain skin conditions.",
        dosage: "Consult a doctor for appropriate dosage based on individual needs and blood levels."
      },
      {
        name: "Probiotics",
        benefit: "May modulate the gut microbiome, potentially influencing immune responses and reducing inflammation linked to skin issues.",
        dosage: "Consult a doctor for appropriate dosage and strain selection."
      },
      {
        name: "Zinc",
        benefit: "Crucial for skin repair and immune function. May help reduce inflammation and promote healing.",
        dosage: "Consult a doctor for appropriate dosage, typical daily amounts for adults range from 11-15 mg."
      },
    ]
  };

  // No loading or error states needed as data is static
  const isLoadingRecommendations = false;
  const recommendationError = null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={20} color="#1e293b" />
        <Text style={styles.backText}>Back to Upload</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Skin Analysis & Recommendations</Text>

      {/* Initial Skin Condition Summary from Image Analysis */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Image Analysis Summary</Text>
        <Text style={styles.summaryText}>
          <Text style={styles.boldText}>Detected Condition:</Text> {skinConditionFromImage}
        </Text>
        <Text style={styles.summaryText}>
          <Text style={styles.boldText}>Severity:</Text> {parsedImageAnalysisResult?.severity || 'N/A'}
        </Text>
      </View>

      {/* AI-Prompted Recommendations (now using mock data) */}
      {recommendationError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{recommendationError}</Text>
          <Text style={styles.errorText}>Please try again or check your backend connection.</Text>
        </View>
      ) : (
        <>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Diet & Supplement Recommendations for {recommendationData.condition}</Text>
          </View>

          {/* Healthy Foods Section */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Healthy Foods</Text>
            {recommendationData.healthy_foods?.length > 0 ? (
              recommendationData.healthy_foods.map((food, index) => (
                <View key={index} style={styles.itemContainer}>
                  <Text style={styles.listItemName}>• {food.name}</Text>
                  {food.nutrients && <Text style={styles.listItemDetail}><Text style={styles.boldText}>Nutrients:</Text> {food.nutrients}</Text>}
                  {food.benefit && <Text style={styles.listItemDetail}><Text style={styles.boldText}>Benefit:</Text> {food.benefit}</Text>}
                </View>
              ))
            ) : (
              <Text style={styles.noDataText}>No specific healthy food recommendations at this time.</Text>
            )}
          </View>

          {/* Foods to Avoid Section */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Foods to Avoid</Text>
            {recommendationData.foods_to_avoid?.length > 0 ? (
              recommendationData.foods_to_avoid.map((food, index) => (
                <Text key={index} style={styles.listItem}>• {food}</Text>
              ))
            ) : (
              <Text style={styles.noDataText}>No specific foods to avoid listed at this time.</Text>
            )}
          </View>

          {/* Supplements Section */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Recommended Supplements</Text>
            {recommendationData.supplements?.length > 0 ? (
              recommendationData.supplements.map((supplement, index) => (
                <View key={index} style={styles.itemContainer}>
                  <Text style={styles.listItemName}>• {supplement.name}</Text>
                  {supplement.dosage && <Text style={styles.listItemDetail}><Text style={styles.boldText}>Dosage:</Text> {supplement.dosage}</Text>}
                  {supplement.benefit && <Text style={styles.listItemDetail}><Text style={styles.boldText}>Benefit:</Text> {supplement.benefit}</Text>}
                </View>
              ))
            ) : (
              <Text style={styles.noDataText}>No specific supplement recommendations at this time.</Text>
            )}
          </View>
        </>
      )}

      {/* Display raw initial analysis result for debugging (optional) */}
      {parsedImageAnalysisResult && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Raw Image Analysis Data (for debugging)</Text>
          <Text style={styles.rawResultText}>{JSON.stringify(parsedImageAnalysisResult, null, 2)}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#f8fafc',
    minHeight: '100%',
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
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 24,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 10,
  },
  summaryText: {
    fontSize: 16,
    color: '#334155',
    lineHeight: 24,
    marginBottom: 8,
  },
  boldText: {
    fontWeight: 'bold',
  },
  listItem: {
    fontSize: 16,
    color: '#334155',
    marginBottom: 8,
    lineHeight: 24,
    marginLeft: 5,
  },
  itemContainer: {
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  listItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 5,
  },
  listItemDetail: {
    fontSize: 14,
    color: '#334155',
    marginLeft: 15,
    lineHeight: 20,
  },
  noDataText: {
    fontSize: 16,
    color: '#64748b',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 10,
  },
  rawResultText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#555',
    backgroundColor: '#f1f5f9',
    padding: 10,
    borderRadius: 8,
    maxHeight: 200,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#334155',
  },
  errorContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#fee2e2', // Light red background
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ef4444', // Red border
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#dc2626', // Darker red text
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
});
