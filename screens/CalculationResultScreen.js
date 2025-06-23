import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Feather } from '@expo/vector-icons';

export default function CalculationResultScreen({ route, navigation }) {
  const { result } = route.params;

  if (!result) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No calculation data found.</Text>
        <Pressable
          style={({ pressed }) => [styles.button, styles.newCalculationButton, pressed && { opacity: 0.8 }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Go Back to Calculator</Text>
        </Pressable>
      </View>
    );
  }

  const ResultRow = ({ label, value, highlight = false, isTotal = false }) => (
    <View style={[styles.resultRow, isTotal && styles.totalResultRow]}>
      <Text style={[styles.resultLabel, highlight && styles.resultLabelHighlight]}>{label}</Text>
      <Text style={[styles.resultValue, highlight && styles.resultValueHighlight, isTotal && styles.totalResultValue]}>
        Ksh {typeof value === 'number' ? value.toFixed(2) : value}
      </Text>
    </View>
  );

  const handleDownload = async () => {
    try {
      const content = `
NET PAY CALCULATION SUMMARY

Gross Pay: Ksh ${result.grossPay?.toFixed(2)}
PAYE: Ksh ${result.paye?.toFixed(2)}
NSSF: Ksh ${result.nssf?.toFixed(2)}
NHIF: Ksh ${result.nhif?.toFixed(2)}
Housing Levy (AHL): Ksh ${result.ahl?.toFixed(2)}
Pension Contribution: Ksh ${result.pension?.toFixed(2)}
Other Deductions: Ksh ${result.allowableDeductions?.toFixed(2)}

Total Deductions: Ksh ${result.totalDeductions?.toFixed(2)}
Net Pay: Ksh ${result.netPay?.toFixed(2)}

Taxable Pay: Ksh ${result.taxableIncome?.toFixed(2)}
Personal Relief: Ksh 2400.00
      `;

      const fileUri = FileSystem.documentDirectory + 'NetPaySummary.txt';
      await FileSystem.writeAsStringAsync(fileUri, content, { encoding: FileSystem.EncodingType.UTF8 });
      await Sharing.shareAsync(fileUri);
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Error', 'Failed to download or share the file.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
      <View style={styles.container}>
        <Text style={styles.title}>NET PAY CALCULATION SUMMARY</Text>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Gross Pay:</Text>
          <Text style={styles.grossPayValue}>Ksh {result.grossPay.toFixed(2)}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Deductions:</Text>
          <ResultRow label="PAYE" value={result.paye} />
          {result.nssf !== undefined && <ResultRow label="NSSF Tier" value={result.nssf} />}
          {result.nhif !== undefined && <ResultRow label="NHIF" value={result.nhif} />}
          {result.ahl !== undefined && <ResultRow label="Housing Levy" value={result.ahl} />}
          {result.pension > 0 && <ResultRow label="Pension Contribution" value={result.pension} />}
          {result.allowableDeductions > 0 && <ResultRow label="Other Allowable Deductions" value={result.allowableDeductions} />}
        </View>

        <View style={styles.section}>
          <ResultRow label="Total Deductions" value={result.totalDeductions} highlight isTotal />
          <ResultRow label="Net Pay" value={result.netPay} highlight isTotal />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>PAYE Information:</Text>
          <ResultRow label="Gross Pay" value={result.grossPay} />
          <ResultRow label="Allowable Deductions" value={result.allowableDeductions} />
          {result.taxableIncome !== undefined && <ResultRow label="Taxable Pay" value={result.taxableIncome} />}
          <ResultRow label="Personal Relief" value={2400.0} />
        </View>

        <View style={styles.buttonGroup}>
          <Pressable
            style={({ pressed }) => [styles.button, styles.printButton, pressed && { opacity: 0.8 }]}
            onPress={() => Alert.alert('Print Feature', 'Printing will be available in a future update.')}
          >
            <Feather name="printer" size={20} color="#fff" />
            <Text style={styles.buttonText}> Print</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.button, styles.downloadButton, pressed && { opacity: 0.8 }]}
            onPress={handleDownload}
          >
            <Feather name="download" size={20} color="#fff" />
            <Text style={styles.buttonText}> Download</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.button, styles.newCalculationButton, pressed && { opacity: 0.8 }]}
            onPress={() => navigation.popToTop('NetPayCalculator')}
          >
            <Feather name="plus-circle" size={20} color="#fff" />
            <Text style={styles.buttonText}> New</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
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
  container: {
    width: '95%',
    maxWidth: 600,
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 15,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 25,
    textAlign: 'center',
  },
  section: {
    marginBottom: 25,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 15,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#34495e',
    marginBottom: 10,
  },
  grossPayValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007bff',
    textAlign: 'right',
    marginBottom: 5,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f8f8',
  },
  totalResultRow: {
    borderBottomWidth: 0,
    borderTopWidth: 1.5,
    borderTopColor: '#ddd',
    marginTop: 10,
    paddingTop: 10,
  },
  resultLabel: {
    fontSize: 16,
    color: '#555',
  },
  resultLabelHighlight: {
    fontSize: 17,
    fontWeight: '600',
    color: '#2c3e50',
  },
  resultValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  resultValueHighlight: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#28a745',
  },
  totalResultValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007bff',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    width: '100%',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    justifyContent: 'center',
    flex: 1,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  printButton: {
    backgroundColor: '#6c757d',
  },
  downloadButton: {
    backgroundColor: '#17a2b8',
  },
  newCalculationButton: {
    backgroundColor: '#007bff',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  errorText: {
    color: '#dc3545',
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
  },
});
