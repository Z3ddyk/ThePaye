// screens/HomeScreen.js
import React from 'react';
import { View, Text, Pressable, StyleSheet, StatusBar } from 'react-native'; // Added Pressable and StatusBar

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#007bff" /> {/* Status bar styling */}
      <Text style={styles.title}>Welcome to the PAYE App</Text>
      <Text style={styles.subtitle}>Your simple guide to net pay calculations 💰</Text>

      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed // Apply pressed style when button is pressed
        ]}
        onPress={() => navigation.navigate('NetPayCalculator')}
      >
        <Text style={styles.buttonText}>Go to Net Pay Calculator</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#007bff', // Solid blue background for a bold look
    // You could also use a linear gradient for more sophistication:
    // background: 'linear-gradient(to bottom, #007bff, #0056b3)',
  },
  title: {
    fontSize: 34, // Larger font size
    fontWeight: 'bold',
    color: '#fff', // White text for contrast
    marginBottom: 10,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.2)', // Subtle text shadow
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 18,
    color: '#e0e0e0', // Lighter grey for subtitle
    marginBottom: 40, // More space below subtitle
    textAlign: 'center',
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#fff', // White background for button
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30, // More rounded corners for button
    shadowColor: '#000', // Shadow for depth
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10, // Android shadow
    minWidth: 250, // Minimum width for the button
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    backgroundColor: '#f0f0f0', // Slightly darker white when pressed
    transform: [{ translateY: 2 }], // Slight press effect
    shadowOpacity: 0.1, // Reduce shadow when pressed
    elevation: 5,
  },
  buttonText: {
    color: '#007bff', // Blue text matching the background
    fontSize: 18,
    fontWeight: 'bold',
  },
});
