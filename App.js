// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import your screen components
import HomeScreen from './screens/HomeScreen';
import NetPayCalculator from './screens/NetPayCalculator';
import CalculationResultScreen from './screens/CalculationResultScreen';
import HistoryScreen from './screens/HistoryScreen'; // New: Import HistoryScreen

// New: Import the HistoryContext provider
import { HistoryProvider } from './utils/HistoryContext';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    // New: Wrap the entire NavigationContainer with HistoryProvider
    <HistoryProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{
              title: 'Welcome',
              headerStyle: { backgroundColor: '#007bff' },
              headerTintColor: '#fff',
              headerTitleStyle: { fontWeight: 'bold' },
            }}
          />
          <Stack.Screen
            name="NetPayCalculator"
            component={NetPayCalculator}
            options={{
              title: 'PAYE Calculator',
              headerStyle: { backgroundColor: '#007bff' },
              headerTintColor: '#fff',
              headerTitleStyle: { fontWeight: 'bold' },
            }}
          />
          <Stack.Screen
            name="CalculationResult"
            component={CalculationResultScreen}
            options={{
              title: 'Calculation Summary',
              headerStyle: { backgroundColor: '#28a745' },
              headerTintColor: '#fff',
              headerTitleStyle: { fontWeight: 'bold' },
              presentation: 'modal', // Makes it pop up like a modal on iOS
            }}
          />
          {/* New: History screen added to the stack */}
          <Stack.Screen
            name="History"
            component={HistoryScreen}
            options={{
              title: 'Previous Calculations',
              headerStyle: { backgroundColor: '#6c757d' }, // Grey header for history
              headerTintColor: '#fff',
              headerTitleStyle: { fontWeight: 'bold' },
            }}
          />
          {/* SalaryInputScreen removed as its functionality is integrated into NetPayCalculator */}
        </Stack.Navigator>
      </NavigationContainer>
    </HistoryProvider>
  );
}
