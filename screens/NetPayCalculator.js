import React, { useState, useContext, useCallback } from 'react'; // Re-added useCallback
import {
  View,
  Text,
  TextInput,
  Switch,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker'; // Ensure this is installed: `npm install @react-native-picker/picker`

import { calculatePAYE } from '../utils/payeLogic';
import { HistoryContext } from '../utils/HistoryContext'; // Import HistoryContext

export default function NetPayCalculator({ navigation }) {
  const { addToHistory } = useContext(HistoryContext); // Access addToHistory from context

  // State variables for all input fields
  const [grossPay, setGrossPay] = useState('');
  const [benefits, setBenefits] = useState('0');
  const [pension, setPension] = useState('0');
  const [allowableDeductions, setAllowableDeductions] = useState('0');
  const [housed, setHoused] = useState(false);
  const [housingType, setHousingType] = useState('1'); // '1' for Ordinary, '2' for Farm
  const [housingValue, setHousingValue] = useState('0');
  const [rent, setRent] = useState('0');

  const [ignoreBenefits, setIgnoreBenefits] = useState(true);
  const [use2025Tiers, setUse2025Tiers] = useState(true);
  const [deductTier2, setDeductTier2] = useState(true);
  const [deductAHL, setDeductAHL] = useState(true);

  // State for loading and error messages
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Re-introducing useCallback for setters passed to memoized components
  const handleSetGrossPay = useCallback(text => setGrossPay(text), []);
  const handleSetBenefits = useCallback(text => setBenefits(text), []);
  const handleSetPension = useCallback(text => setPension(text), []);
  const handleSetAllowableDeductions = useCallback(text => setAllowableDeductions(text), []);
  const handleSetHousingValue = useCallback(text => setHousingValue(text), []);
  const handleSetRent = useCallback(text => setRent(text), []);
  // Note: For simple boolean setters like setHoused, setIgnoreBenefits etc., useCallback is less critical
  // unless those setters are frequently passed as props to deeply nested, memoized components.

  const handleCalculate = async () => {
    setLoading(true); // Start loading indicator
    setErrorMessage(''); // Clear any previous error messages

    // Parse all string inputs to numbers. Use 0 if empty or invalid for optional fields.
    const parsedGross = parseFloat(grossPay);
    const parsedBenefits = parseFloat(benefits || '0');
    const parsedPension = parseFloat(pension || '0');
    const parsedAllowableDeductions = parseFloat(allowableDeductions || '0');
    const parsedHousingValue = parseFloat(housingValue || '0');
    const parsedRent = parseFloat(rent || '0');

    // --- Input Validation ---
    if (isNaN(parsedGross) || parsedGross <= 0) {
      setErrorMessage('Gross Pay must be a positive number.');
      setLoading(false);
      return;
    }

    if (
      isNaN(parsedBenefits) || parsedBenefits < 0 ||
      isNaN(parsedPension) || parsedPension < 0 ||
      isNaN(parsedAllowableDeductions) || parsedAllowableDeductions < 0 ||
      (housed && (isNaN(parsedHousingValue) || parsedHousingValue < 0 || isNaN(parsedRent) || parsedRent < 0))
    ) {
      setErrorMessage('Please ensure all numerical inputs are valid non-negative numbers.');
      setLoading(false);
      return;
    }

    try {
      const result = await calculatePAYE({
        grossPay: parsedGross,
        benefits: parsedBenefits,
        pension: parsedPension,
        allowableDeductions: parsedAllowableDeductions,
        housed,
        housingType,
        housingValue: parsedHousingValue,
        rent: parsedRent,
        ignoreBenefits,
        use2025Tiers,
        deductTier2,
        deductAHL,
      });

      addToHistory(result); // Save result to history context
      navigation.navigate('CalculationResult', { result }); // Navigate to results screen

    } catch (err) {
      setErrorMessage('An error occurred during calculation. Please try again.');
      console.error("Calculation error:", err); // Log full error for debugging
    } finally {
      setLoading(false); // Stop loading indicator
    }
  };

  const resetAll = () => {
    setGrossPay('');
    setBenefits('0');
    setPension('0');
    setAllowableDeductions('0');
    setHousingValue('0');
    setRent('0');
    setHoused(false);
    setHousingType('1');
    setIgnoreBenefits(true);
    setUse2025Tiers(true);
    setDeductTier2(true);
    setDeductAHL(true);
    setErrorMessage('');
  };

  // --- Helper Components (Re-introduced React.memo for stability) ---

  const LabelInput = React.memo(function LabelInput({ label, value, setValue }) { // Changed back to React.memo
    // console.log(`Rendering LabelInput: ${label}, value: ${value}`); // Uncomment for debugging re-renders
    return (
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={setValue}
          keyboardType="numeric"
          placeholder="e.g. 10000"
          key={label} // Keeping key prop
          selectTextOnFocus={true}
          autoComplete="off"
          spellCheck={false}
          autoCorrect={false}
          autoCapitalize="none"
        />
      </View>
    );
  });

  const SwitchRow = React.memo(function SwitchRow({ label, value, onValueChange }) { // Changed back to React.memo
    return (
      <View style={styles.switchRow}>
        <Text style={styles.label}>{label}</Text>
        <Switch
          value={value}
          onValueChange={onValueChange}
          key={label} // Keeping key prop
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={value ? "#007bff" : "#f4f3f4"}
          ios_backgroundColor="#3e3e3e"
        />
      </View>
    );
  });

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollViewContent} keyboardShouldPersistTaps="handled">
        <View style={styles.innerContainer}>
          <Text style={styles.title}>PAYE Net Pay Calculator</Text>

          <LabelInput label="Gross Pay (Ksh)" value={grossPay} setValue={handleSetGrossPay} />
          <LabelInput label="Non-Cash Benefits (Ksh)" value={benefits} setValue={handleSetBenefits} />
          <LabelInput label="Pension Contribution (Ksh)" value={pension} setValue={handleSetPension} />
          <LabelInput label="Other Allowable Deductions (Ksh)" value={allowableDeductions} setValue={handleSetAllowableDeductions} />

          <SwitchRow label="Housed by Employer" value={housed} onValueChange={setHoused} />

          {housed && (
            <>
              <Text style={styles.label}>Housing Type</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={housingType}
                  onValueChange={setHousingType}
                  style={styles.picker}
                  itemStyle={styles.pickerItem}
                  key="housingTypePicker" // Ensure stable key for Picker
                >
                  <Picker.Item label="Ordinary" value="1" />
                  <Picker.Item label="Farm" value="2" />
                </Picker>
              </View>

              <LabelInput label="Value of Housing (Ksh)" value={housingValue} setValue={handleSetHousingValue} />
              <LabelInput label="Rent Paid to Employer (Ksh)" value={rent} setValue={handleSetRent} />
            </>
          )}

          <SwitchRow label="Ignore Benefits ≤ Ksh 5,000" value={ignoreBenefits} onValueChange={setIgnoreBenefits} />
          <SwitchRow label="Use 2025 NSSF Tiers" value={use2025Tiers} onValueChange={setUse2025Tiers} />
          <SwitchRow label="Deduct Tier II NSSF" value={deductTier2} onValueChange={setDeductTier2} />
          <SwitchRow label="Deduct AHL" value={deductAHL} onValueChange={setDeductAHL} />

          {errorMessage !== '' && <Text style={styles.error}>{errorMessage}</Text>}

          <Pressable
            style={({ pressed }) => [styles.button, pressed && { opacity: 0.8 }]}
            onPress={handleCalculate}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Calculate</Text>}
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.button, styles.resetButton, pressed && { opacity: 0.8 }]}
            onPress={resetAll}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Reset</Text>
          </Pressable>

          {/* Button to navigate to history screen */}
          <Pressable
            style={({ pressed }) => [styles.button, styles.historyButton, pressed && { opacity: 0.8 }]}
            onPress={() => navigation.navigate('History')}
          >
            <Text style={styles.buttonText}>View History</Text>
          </Pressable>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f4f8',
    paddingVertical: 20,
  },
  innerContainer: {
    width: '95%',
    maxWidth: 600,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 25,
    textAlign: 'center',
    color: '#2c3e50',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
    color: '#444',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 15,
    fontSize: 16,
  },
  fieldContainer: {
    marginBottom: 15,
    width: '100%',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingVertical: 5,
  },
  pickerWrapper: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  pickerItem: {
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  resetButton: {
    backgroundColor: '#6c757d',
  },
  historyButton: {
    backgroundColor: '#343a40',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  error: {
    color: 'red',
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 14,
  },
});
