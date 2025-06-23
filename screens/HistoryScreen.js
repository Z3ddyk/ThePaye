import React, { useContext } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons'; // Ensure you have this installed: `expo install @expo/vector-icons`
import { useNavigation } from '@react-navigation/native';
import { HistoryContext } from '../utils/HistoryContext'; // Import the HistoryContext

export default function HistoryScreen() {
  const navigation = useNavigation();
  const { history } = useContext(HistoryContext); // Access history from the context

  // Render function for each item in the FlatList
  const renderItem = ({ item, index }) => (
    <Pressable
      style={styles.historyItem}
      // On press, navigate to CalculationResult screen, passing the specific history item's data
      onPress={() => navigation.navigate('CalculationResult', { result: item })}
    >
      <Feather name="file-text" size={20} color="#007bff" />
      <View style={styles.itemDetails}>
        {/* Display Calculation # from newest to oldest */}
        <Text style={styles.itemTitle}>Calculation #{history.length - index}</Text>
        {/* Display Net Pay */}
        <Text style={styles.itemSub}>Net Pay: Ksh {item.netPay.toFixed(2)}</Text>
        {/* Display timestamp for better context in history */}
        <Text style={styles.itemDate}>{new Date(item.timestamp).toLocaleString()}</Text>
      </View>
      <Feather name="chevron-right" size={20} color="#999" />
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Calculation History</Text>
      {history.length === 0 ? (
        <Text style={styles.empty}>No calculations saved yet.</Text>
      ) : (
        <FlatList
          // Reverse the history array to show the most recent calculation first
          data={[...history].reverse()}
          // Use the timestamp as a key if available, otherwise fallback to index
          keyExtractor={(item, index) => item.timestamp || index.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.flatListContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa', // Light background
  },
  title: {
    fontSize: 24, // Slightly larger title
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  empty: {
    textAlign: 'center',
    color: '#666',
    marginTop: 50,
    fontSize: 16,
  },
  flatListContent: {
    paddingBottom: 20, // Add some padding at the bottom for scrolling
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10, // More rounded corners
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000', // Subtle shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // Android shadow
  },
  itemDetails: {
    flex: 1,
    marginLeft: 15,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  itemSub: {
    color: '#555',
    fontSize: 15,
    marginTop: 2,
  },
  itemDate: {
    color: '#888',
    fontSize: 12,
    marginTop: 5,
  },
});
