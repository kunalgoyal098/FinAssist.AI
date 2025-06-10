"use server";

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getTaxAdvice(userData) {
  try {
    console.log("Received tax data:", userData);
    const prompt = `
As a tax expert, analyze the following financial data and provide comprehensive tax advice and return estimates for an Indian taxpayer:

TAXPAYER DETAILS:
Financial Year: ${userData.financialYear}

INCOME:
1. Annual Salary: ₹${userData.salary}
2. Annual Bonuses: ₹${userData.bonuses}
3. Rental Income: ₹${userData.rentalIncome}
4. Other Income: ₹${userData.otherIncome}
5. Savings Bank Interest: ₹${userData.savingsBankInterest}

DEDUCTIONS AND INVESTMENTS:
1. EPF Contribution: ₹${userData.epfContribution}
2. PPF Investment: ₹${userData.ppfInvestment}
3. ELSS Investment: ₹${userData.elssInvestment}
4. Other 80C Investments: ₹${userData.section80C}
5. Medical Insurance Premium: ₹${userData.medicalInsurance}
6. NPS Contribution: ₹${userData.npsContribution}
7. Home Loan Interest: ₹${userData.homeLoanInterest}
8. Education Loan Interest: ₹${userData.educationLoanInterest}
9. Charity Donations: ₹${userData.charityDonations}
10. Standard Deduction: ₹${userData.standardDeduction}

HRA DETAILS:
1. HRA Received: ₹${userData.hraReceived}
2. Annual Rent Paid: ₹${userData.rentPaid}
3. City Type: ${userData.cityTier}

REQUIRED RESPONSE FORMAT:
Provide the analysis in valid JSON format with the following structure:

{
  "gross_income": {
    "total": <number>,
    "breakdown": {
      "salary": <number>,
      "hra_exemption": <number>,
      "rental_income": <number>,
      "other_income": <number>,
      "savings_interest": <number>
    }
  },
  "deductions": {
    "total": <number>,
    "breakdown": {
      "section_80C": {
        "total": <number>,
        "eligible_amount": <number>,
        "components": {
          "epf": <number>,
          "ppf": <number>,
          "elss": <number>,
          "others": <number>
        }
      },
      "section_80D": <number>,
      "section_80CCD": <number>,
      "section_24": <number>,
      "section_80E": <number>,
      "section_80G": <number>,
      "standard_deduction": <number>
    }
  },
  "tax_computation": {
    "taxable_income": <number>,
    "tax_old_regime": {
      "tax_amount": <number>,
      "cess": <number>,
      "surcharge": <number>,
      "total_tax": <number>
    },
    "tax_new_regime": {
      "tax_amount": <number>,
      "cess": <number>,
      "surcharge": <number>,
      "total_tax": <number>
    },
    "recommended_regime": "old" | "new",
    "tax_savings": <number>
  },
  "tax_saving_recommendations": [
    {
      "category": "<string>",
      "current_investment": <number>,
      "recommended_investment": <number>,
      "additional_tax_saving": <number>,
      "reasoning": "<string>"
    }
  ],
  "compliance_notes": [
    "<string>"
  ],
  "summary": {
    "total_tax_payable": <number>,
    "monthly_tax_liability": <number>,
    "effective_tax_rate": <number>,
    "key_points": [
      "<string>"
    ]
  }
}

Consider the following while generating the response:
1. Calculate HRA exemption based on:
   - Actual HRA received
   - 50% of salary for metro cities, 40% for non-metro
   - Actual rent paid minus 10% of salary
2. Apply appropriate tax slabs for both old and new regimes
3. Consider surcharge and cess based on income levels
4. Suggest optimal tax saving investments
5. Include compliance requirements and deadlines
6. Provide practical tax saving strategies
7. Consider both old and new tax regimes and recommend the better option

The response should be detailed yet practical, focusing on maximizing tax benefits while ensuring compliance.`;

    console.log("Sending request to OpenAI...");
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert tax consultant with deep knowledge of Indian tax laws, deductions, and tax planning strategies. IMPORTANT: You must ONLY return a valid JSON object matching the exact schema provided, with no additional text, explanations, or formatting. Your entire response must be parseable by JSON.parse()."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    console.log("Received response from OpenAI");
    const response = completion.choices[0].message.content;
    const taxAdvice = JSON.parse(response);
    console.log("Parsed tax advice:", taxAdvice);
    
    return {
      success: true,
      data: taxAdvice
    };
  } catch (error) {
    console.error("Error getting tax advice:", error);
    return {
      success: false,
      error: `Failed to generate tax advice: ${error.message}`
    };
  }
} 