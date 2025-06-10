"use server";

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getInvestmentRecommendation(userData) {
  try {
    console.log("Received user data:", userData);
    const prompt = `
Based on the following investor profile, recommend an optimal investment strategy:

INVESTOR PROFILE:
- Age: ${userData.age} years
- Monthly Income: $${userData.monthlySalary}
- Monthly Expenses: $${userData.monthlyExpenses}
- Current EMIs: $${userData.emiAmount}/month for ${userData.emiDuration} more months
- Other Liabilities: $${userData.otherLiabilities}
- Risk Tolerance: ${userData.riskPreference} (on scale of 1-10)
- Investment Horizon: ${userData.investmentHorizon} years
- Primary Financial Goals: ${userData.financialGoals}
- Geography: ${userData.userLocation}
- Existing Investments: ${userData.existingInvestments}
- Family Dependents: ${userData.dependents}
- Tax Bracket: ${userData.taxBracket}

REQUIRED RESPONSE FORMAT:
Please provide your recommendation in valid JSON format with the following structure:

{
  "monthly_investment_recommendation": {
    "amount": <numeric_value>,
    "percentage_of_income": <numeric_value>,
    "reasoning": "<explanation>"
  },
  "risk_assessment": {
    "risk_level": <numeric_value_1_to_10>,
    "expected_annual_return": <percentage>,
    "expected_volatility": <percentage>,
    "time_horizon_compatible": <boolean>,
    "reasoning": "<explanation>"
  },
  "asset_allocation": {
    "stocks_percentage": <numeric_value>,
    "mutual_funds_etfs_percentage": <numeric_value>,
    "bonds_percentage": <numeric_value>,
    "cash_equivalents_percentage": <numeric_value>,
    "alternative_investments_percentage": <numeric_value>,
    "reasoning": "<explanation>"
  },
  "investment_categories": [
    {
      "category": "<category_name>",
      "subcategory": "<subcategory_name>",
      "allocation_percentage": <numeric_value>,
      "risk_contribution": <numeric_value>,
      "expected_return": <numeric_value>,
      "reasoning": "<explanation>",
      "recommended_symbols": {
        "primary": ["<symbol1>", "<symbol2>"],
        "alternative": ["<symbol3>", "<symbol4>"],
        "target_allocation": {
          "<symbol1>": <percentage>,
          "<symbol2>": <percentage>,
          "<symbol3>": <percentage>,
          "<symbol4>": <percentage>
        }
      }
    }
  ],
  "specific_considerations": {
    "tax_efficiency_notes": "<text>",
    "liquidity_requirements": "<text>",
    "rebalancing_frequency": "<recommendation>",
    "major_concerns": "<text>"
  }
}

IMPORTANT GUIDELINES:
1. For each category's recommended_symbols:
   - Include 2-3 primary symbols and 1-2 alternative symbols
   - Specify target_allocation percentages that sum to 100% within each category
   - Consider price levels when allocating to ensure even distribution
   - Primary symbols should get higher allocation percentages

2. For stocks/ETFs/bonds selection:
   - Choose liquid assets with sufficient trading volume
   - Consider price points that allow for proper monthly investment allocation
   - Diversify across different price points to enable flexible allocation
   - Include some lower-priced options to ensure monthly amounts can be fully invested

3. Allocation Strategy:
   - Ensure each category can be properly invested with the monthly amount
   - Consider minimum investment amounts and share prices
   - Distribute allocations to enable full utilization of monthly investment
   - Account for transaction costs and minimum share purchases

Please ensure the recommendations allow for practical implementation of the monthly investment amount across all selected symbols.`;

    console.log("Sending request to OpenAI...");
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a professional financial advisor with expertise in investment planning and portfolio management. Provide detailed, personalized investment recommendations based on the user's profile. Always respond in valid JSON format as specified. Include specific stock/ETF/bond symbols that match each investment category and the investor's profile."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    console.log("Received response from OpenAI");
    const response = completion.choices[0].message.content;
    const recommendation = JSON.parse(response);
    console.log("Parsed recommendation:", recommendation);
    return {
      success: true,
      data: recommendation
    };
  } catch (error) {
    console.error("Error getting investment recommendation:", error);
    console.error("Error details:", error.message);
    return {
      success: false,
      error: `Failed to generate investment recommendation: ${error.message}`
    };
  }
} 