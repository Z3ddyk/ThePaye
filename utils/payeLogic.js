// utils/payeLogic.js

/**
 * Calculates PAYE, NSSF, NHIF (SHIF), AHL, and Net Pay for Kenya based on KRA guidelines.
 *
 * @param {object} params - Object containing all input parameters for calculation.
 * @param {number} params.grossPay - Gross monthly salary.
 * @param {number} params.benefits - Non-cash benefits.
 * @param {number} params.pension - Pension contribution by employee.
 * @param {number} params.allowableDeductions - Other allowable deductions (e.g., mortgage interest, post-retirement medical fund not covered by specific inputs).
 * @param {boolean} params.housed - True if housed by employer.
 * @param {string} params.housingType - Type of housing (e.g., '1' for Ordinary, '2' for Farm - currently not used for specific calculations).
 * @param {number} params.housingValue - Value of employer-provided housing (used for housing benefit).
 * @param {number} params.rent - Rent paid to employer for housing.
 * @param {boolean} params.ignoreBenefits - Whether to ignore non-cash benefits up to Ksh 5,000.
 * @param {boolean} params.use2025Tiers - Whether to use 2025 NSSF Tiers (reflecting NSSF Act 2013 phased implementation).
 * @param {boolean} params.deductTier2 - Whether to deduct Tier II NSSF.
 * @param {boolean} params.deductAHL - Whether to deduct Affordable Housing Levy.
 * @returns {object} An object containing calculated values: grossPay, benefits, pension, allowableDeductions,
 * housingValue, rent, taxableIncome, paye, nssf, nhif, ahl, totalDeductions, netPay.
 */
export function calculatePAYE({
  grossPay,
  benefits,
  pension,
  allowableDeductions,
  housed,
  housingType, // Not explicitly used in this logic, but passed through
  housingValue,
  rent,
  ignoreBenefits,
  use2025Tiers,
  deductTier2,
  deductAHL,
}) {
  let paye = 0;
  let nssf = 0;
  let nhif = 0; // Social Health Insurance Fund (SHIF)
  let ahl = 0;
  let taxableBenefits = 0;
  let taxableIncome = 0;
  let totalDeductions = 0;
  let netPay = 0;

  // --- 1. Calculate Taxable Non-Cash Benefits ---
  // "Value of benefit, advantage or facility in excess of the allowable limit of Kshs 5,000 per month" (Page 3)
  if (!ignoreBenefits) { // If ignoreBenefits is false, all benefits are potentially taxable
    taxableBenefits = benefits;
  } else { // If ignoreBenefits is true, only excess above 5000 is taxable
    taxableBenefits = Math.max(0, benefits - 5000);
  }

  // Value of Housing benefit (simplified from KRA document - if housed, it adds value)
  // KRA says "Value of housing- where an employee is provided residential housing by the employer" is taxable.
  // Common practice: (Value - Rent Paid) if the value is higher.
  if (housed && housingValue > 0) {
    taxableBenefits += Math.max(0, housingValue - rent);
  }
  taxableBenefits = parseFloat(taxableBenefits.toFixed(2));


  // --- 2. Calculate NSSF Contribution ---
  // Based on NSSF Act, 2013 phased implementation, commonly understood tiers.
  // The provided KRA PDF does not specify NSSF rates, so this is based on common knowledge of Act 2013.
  const NSSF_LEL = 6000;  // Lower Earning Limit
  const NSSF_BWC = 18000; // Basic Wage Ceiling for Tier I (max for Tier I)
  const NSSF_RATE = 0.06; // 6%

  if (use2025Tiers) { // Reflects NSSF Act 2013 implementation tiers
    // Tier I
    const tier1Contribution = Math.min(grossPay, NSSF_LEL) * NSSF_RATE; // Up to LEL (6000)
    nssf += tier1Contribution;

    // Tier II (if deductTier2 is enabled and grossPay exceeds LEL)
    if (deductTier2 && grossPay > NSSF_LEL) {
      const tier2AssessablePay = Math.min(grossPay, NSSF_BWC) - NSSF_LEL;
      const tier2Contribution = tier2AssessablePay * NSSF_RATE;
      nssf += tier2Contribution;
    }
    // Note: Actual NSSF Act 2013 goes up to Tier IV (KES 3600 total contribution).
    // This implementation simplifies to Tier I and basic Tier II cap for demo.
    // Full implementation would need more tiers and potentially higher caps.
  } else {
    // Old NSSF rates (flat KES 200)
    nssf = 200;
  }
  nssf = parseFloat(nssf.toFixed(2));


  // --- 3. Calculate NHIF (SHIF) Contribution ---
  // The KRA PDF mentions "Contributions made to the Social Health Insurance Fund (SHIF)" as an allowable deduction.
  // It does NOT provide the actual NHIF/SHIF rates.
  // We will reuse the NHIF bands that were in the previous code for a functional example.
  if (grossPay <= 5999) nhif = 150;
  else if (grossPay <= 7999) nhif = 300;
  else if (grossPay <= 11999) nhif = 400;
  else if (grossPay <= 14999) nhif = 500;
  else if (grossPay <= 19999) nhif = 600;
  else if (grossPay <= 24999) nhif = 750;
  else if (grossPay <= 29999) nhif = 850;
  else if (grossPay <= 34999) nhif = 900;
  else if (grossPay <= 39999) nhif = 950;
  else if (grossPay <= 44999) nhif = 1000;
  else if (grossPay <= 49999) nhif = 1100;
  else if (grossPay <= 59999) nhif = 1200;
  else if (grossPay <= 69999) nhif = 1300;
  else if (grossPay <= 79999) nhif = 1400;
  else if (grossPay <= 89999) nhif = 1500;
  else if (grossPay <= 99999) nhif = 1600;
  else nhif = 1700;
  nhif = parseFloat(nhif.toFixed(2));


  // --- 4. Calculate Affordable Housing Levy (AHL) ---
  // "Each employee and employer shall pay the Affordable Housing Levy at a rate of 1.5% of the employee's gross monthly salary;" (Page 5)
  if (deductAHL) {
    ahl = grossPay * 0.015; // 1.5% of gross pay
  }
  ahl = parseFloat(ahl.toFixed(2));


  // --- 5. Calculate Taxable Income for PAYE ---
  // Taxable Income = Gross Pay + Taxable Benefits - Allowable Deductions
  // Allowable deductions include: AHL, SHIF, Pension (capped)
  let totalAllowableDeductions = allowableDeductions;

  // Pension contribution is allowable up to Kshs 30,000 per month (Page 3)
  const allowablePension = Math.min(pension, 30000);
  totalAllowableDeductions += allowablePension;

  // AHL is an allowable deduction (Page 4)
  totalAllowableDeductions += ahl;

  // SHIF (NHIF) is an allowable deduction (Page 4)
  totalAllowableDeductions += nhif;

  // Basic taxable income before applying any allowable deductions specific to PAYE calculation
  taxableIncome = grossPay + taxableBenefits;

  // Deduct from taxable income only the *allowable* portions.
  // NSSF is also deductible, but often handled as part of taxable income calculation for PAYE.
  // The KRA PDF states NSSF is generally deductible from total income before PAYE.
  taxableIncome -= nssf; // NSSF is an allowable deduction for PAYE purposes.

  taxableIncome -= allowableDeductions; // Other user-provided allowable deductions
  taxableIncome -= pension; // Pension itself is deducted, but limited by KRA rule as 'allowablePension' for TI calculation.
                           // Here, 'pension' is the full amount the user input, which is also a cash deduction.
                           // Re-evaluate how pension affects TI and totalDeductions to avoid double counting.
                           // For now, let's treat pension as a deduction from gross, *and* its allowable portion reduces TI.

  // The KRA PDF (Page 4) states: "Amounts deductible in determining the taxable employment income shall include:
  // 2. Amount deducted as Affordable Housing Levy... 4. Contributions made to the Social Health Insurance Fund (SHIF)."
  // And "Contributions made to a registered pension or provident fund or a registered individual retirement fund up to a limit of Kshs. 30,000 per month."
  // So, AHL, SHIF, and the *allowable part* of pension directly reduce the income subject to PAYE.

  // Let's re-calculate taxableIncome more carefully based on KRA structure:
  // Taxable Income = Gross Pay + Taxable Benefits - (Allowable Pension) - (Allowable Mortgage) - (Allowable Post-Retirement Med) - AHL - SHIF - NSSF
  // Since only `pension` and `allowableDeductions` are inputs apart from standard statutory ones:

  let incomeSubjectToPAYE = grossPay + taxableBenefits;
  incomeSubjectToPAYE -= Math.min(pension, 30000); // Allowable pension deduction
  incomeSubjectToPAYE -= nssf; // NSSF is an allowable deduction for PAYE
  incomeSubjectToPAYE -= nhif; // SHIF is an allowable deduction for PAYE
  incomeSubjectToPAYE -= ahl;  // AHL is an allowable deduction for PAYE
  incomeSubjectToPAYE -= allowableDeductions; // Other user-specified allowable deductions

  taxableIncome = Math.max(0, incomeSubjectToPAYE); // Ensure taxable income is not negative
  taxableIncome = parseFloat(taxableIncome.toFixed(2));


  // --- 6. Calculate PAYE ---
  // Based on Finance Act 2023 (effective 1st July, 2023) Tax Bands (Page 3)
  const KRA_MONTHLY_RELIEF = 2400.00;
  let taxBeforeRelief = 0;

  if (taxableIncome <= 24000) {
    taxBeforeRelief = taxableIncome * 0.10;
  } else if (taxableIncome <= 32333) { // 24000 + 8333
    taxBeforeRelief = (24000 * 0.10) + ((taxableIncome - 24000) * 0.25);
  } else if (taxableIncome <= 500000) { // 32333 + 467667
    taxBeforeRelief = (24000 * 0.10) + (8333 * 0.25) + ((taxableIncome - 32333) * 0.30);
  } else if (taxableIncome <= 800000) { // 500000 + 300000
    taxBeforeRelief = (24000 * 0.10) + (8333 * 0.25) + (467667 * 0.30) + ((taxableIncome - 500000) * 0.325);
  } else { // Above 800,000
    taxBeforeRelief = (24000 * 0.10) + (8333 * 0.25) + (467667 * 0.30) + (300000 * 0.325) + ((taxableIncome - 800000) * 0.35);
  }

  paye = Math.max(0, taxBeforeRelief - KRA_MONTHLY_RELIEF);
  paye = parseFloat(paye.toFixed(2));


  // --- 7. Calculate Total Deductions from Gross Pay ---
  // This sums up all the cash deductions that reduce the take-home pay.
  // Note: pension and allowableDeductions are already used to reduce taxableIncome,
  // but they are also cash deductions from the gross pay.
  totalDeductions = paye + nssf + nhif + ahl + pension + allowableDeductions;
  totalDeductions = parseFloat(totalDeductions.toFixed(2));


  // --- 8. Calculate Net Pay ---
  netPay = grossPay - totalDeductions;
  netPay = parseFloat(netPay.toFixed(2));


  // Return all relevant calculated values
  return {
    grossPay: parseFloat(grossPay.toFixed(2)),
    benefits: parseFloat(benefits.toFixed(2)),
    pension: parseFloat(pension.toFixed(2)),
    allowableDeductions: parseFloat(allowableDeductions.toFixed(2)),
    housed,
    housingValue: parseFloat(housingValue.toFixed(2)),
    rent: parseFloat(rent.toFixed(2)),
    taxableBenefits: taxableBenefits, // Added for potential display
    taxableIncome: taxableIncome,
    paye: paye,
    nssf: nssf,
    nhif: nhif, // Now represents SHIF
    ahl: ahl,
    totalDeductions: totalDeductions,
    netPay: netPay,
    personalReliefUsed: KRA_MONTHLY_RELIEF, // For display on results screen
  };
}
