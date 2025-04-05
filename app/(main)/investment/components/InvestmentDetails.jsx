"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function InvestmentDetails({ recommendation, monthlyAmount }) {
  const [stockRecommendations, setStockRecommendations] = useState([]);
  const [etfRecommendations, setEtfRecommendations] = useState([]);
  const [bondRecommendations, setBondRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvestmentData = async () => {
      try {
        setLoading(true);
        
        // Filter categories by type and log them for debugging
        const stockCategories = recommendation.investment_categories.filter(
          cat => cat.category.toLowerCase().includes('stock') || 
                cat.category.toLowerCase().includes('equity')
        );
        
        const etfCategories = recommendation.investment_categories.filter(
          cat => cat.category.toLowerCase().includes('etf') || 
                cat.category.toLowerCase().includes('fund')
        );
        
        const bondCategories = recommendation.investment_categories.filter(
          cat => cat.category.toLowerCase().includes('bond') || 
                cat.category.toLowerCase().includes('fixed income')
        );

        console.log('Categories:', {
          stocks: stockCategories,
          etfs: etfCategories,
          bonds: bondCategories
        });

        // Get all symbols from each category
        const getAllSymbols = (categories) => {
          const symbols = new Set();
          categories.forEach(category => {
            if (category.recommended_symbols) {
              [...category.recommended_symbols.primary, ...category.recommended_symbols.alternative]
                .forEach(symbol => symbols.add(symbol));
            }
          });
          return Array.from(symbols);
        };

        const stockSymbols = getAllSymbols(stockCategories);
        const etfSymbols = getAllSymbols(etfCategories);
        const bondSymbols = getAllSymbols(bondCategories);

        // Calculate category amounts
        const stocksAmount = (monthlyAmount * recommendation.asset_allocation.stocks_percentage) / 100;
        const etfsAmount = (monthlyAmount * recommendation.asset_allocation.mutual_funds_etfs_percentage) / 100;
        const bondsAmount = (monthlyAmount * recommendation.asset_allocation.bonds_percentage) / 100;
        const cashAmount = (monthlyAmount * recommendation.asset_allocation.cash_equivalents_percentage) / 100;
        const alternativesAmount = (monthlyAmount * recommendation.asset_allocation.alternative_investments_percentage) / 100;

        console.log('Allocation amounts:', {
          total: monthlyAmount,
          stocks: stocksAmount,
          etfs: etfsAmount,
          bonds: bondsAmount,
          cash: cashAmount,
          alternatives: alternativesAmount
        });

        // Fetch market data
        const fetchQuotes = async (symbols) => {
          if (!symbols.length) return [];
          try {
            const response = await fetch('/api/yahoo-finance/quotes', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ symbols })
            });
            const data = await response.json();
            console.log('Fetched quotes:', data);
            return data;
          } catch (error) {
            console.error('Error fetching quotes:', error);
            return [];
          }
        };

        const [stocksData, etfsData, bondsData] = await Promise.all([
          fetchQuotes(stockSymbols),
          fetchQuotes(etfSymbols),
          fetchQuotes(bondSymbols)
        ]);

        // Process investment data
        const processInvestments = (data, totalAmount, categories) => {
          if (!data.length || !categories.length) return [];
          
          const investments = [];
          
          // Process each category separately to maintain allocation percentages
          categories.forEach(category => {
            const categoryAmount = (totalAmount * category.allocation_percentage) / 100;
            console.log(`Processing category ${category.category} with amount $${categoryAmount}`);
            
            // Get target allocations for this category
            const targetAllocations = category.recommended_symbols.target_allocation || {};
            const symbols = [
              ...category.recommended_symbols.primary,
              ...category.recommended_symbols.alternative
            ];
            
            // If no target allocations provided, create equal distribution
            if (Object.keys(targetAllocations).length === 0) {
              const equalPercentage = 100 / symbols.length;
              symbols.forEach(symbol => {
                targetAllocations[symbol] = equalPercentage;
              });
            }
            
            // Filter and sort data for this category's symbols
            const categoryData = data.filter(item => symbols.includes(item.symbol));
            
            if (categoryData.length) {
              // Calculate initial shares for each symbol based on target allocation
              categoryData.forEach(item => {
                const targetPercentage = targetAllocations[item.symbol] || 0;
                const targetAmount = (categoryAmount * targetPercentage) / 100;
                const shares = Math.floor(targetAmount / item.regularMarketPrice);
                const totalValue = shares * item.regularMarketPrice;
                
                console.log(`Processing ${item.symbol}:`, {
                  targetPercentage,
                  targetAmount,
                  price: item.regularMarketPrice,
                  shares,
                  totalValue
                });
                
                if (shares > 0) {
                  investments.push({
                    symbol: item.symbol,
                    name: item.longName || item.shortName,
                    price: item.regularMarketPrice,
                    shares,
                    totalValue,
                    changePercent: item.regularMarketChangePercent,
                    category: category.category,
                    subcategory: category.subcategory,
                    expectedReturn: category.expected_return,
                    reasoning: category.reasoning,
                    isPrimary: category.recommended_symbols.primary.includes(item.symbol),
                    allocation: targetPercentage
                  });
                }
              });
              
              // Calculate remaining amount and distribute it
              const investedAmount = investments
                .filter(inv => inv.category === category.category)
                .reduce((sum, inv) => sum + inv.totalValue, 0);
              
              const remainingAmount = categoryAmount - investedAmount;
              
              if (remainingAmount > 0) {
                console.log(`Distributing remaining amount $${remainingAmount} for ${category.category}`);
                
                // Sort by price (ascending) to maximize remaining amount usage
                const sortedData = [...categoryData].sort((a, b) => a.regularMarketPrice - b.regularMarketPrice);
                
                for (const item of sortedData) {
                  const additionalShares = Math.floor(remainingAmount / item.regularMarketPrice);
                  if (additionalShares > 0) {
                    const existingInvestment = investments.find(inv => inv.symbol === item.symbol);
                    if (existingInvestment) {
                      const additionalValue = additionalShares * item.regularMarketPrice;
                      existingInvestment.shares += additionalShares;
                      existingInvestment.totalValue += additionalValue;
                      break; // Stop after successfully allocating remaining amount
                    }
                  }
                }
              }
            }
          });
          
          return investments;
        };

        const processedStocks = processInvestments(stocksData, stocksAmount, stockCategories);
        const processedEtfs = processInvestments(etfsData, etfsAmount, etfCategories);
        const processedBonds = processInvestments(bondsData, bondsAmount, bondCategories);

        console.log('Processed investments:', {
          stocks: processedStocks,
          etfs: processedEtfs,
          bonds: processedBonds
        });

        setStockRecommendations(processedStocks);
        setEtfRecommendations(processedEtfs);
        setBondRecommendations(processedBonds);

      } catch (error) {
        console.error('Error in fetchInvestmentData:', error);
      } finally {
        setLoading(false);
      }
    };

    if (recommendation && monthlyAmount) {
      fetchInvestmentData();
    }
  }, [recommendation, monthlyAmount]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const renderInvestmentCard = (title, investments) => (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {investments.map((investment) => (
            <div key={investment.symbol} className="p-4 border rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{investment.symbol}</h4>
                    {investment.shares > 0 && (
                      investment.isPrimary ? (
                        <Badge variant="default">Primary</Badge>
                      ) : (
                        <Badge variant="secondary">Alternative</Badge>
                      )
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{investment.name}</p>
                  <p className="text-xs text-gray-400">
                    {investment.subcategory || investment.category} ({investment.allocation}%)
                  </p>
                </div>
                <div className={`text-sm ${investment.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {investment.changePercent.toFixed(2)}%
                </div>
              </div>
              <div className="mt-2">
                <p className="text-sm">Price: ${investment.price.toFixed(2)}</p>
                <p className="text-sm">Recommended Shares: {investment.shares}</p>
                <p className="text-sm">Total: ${investment.totalValue.toFixed(2)}</p>
                <p className="text-sm text-gray-500">Expected Return: {investment.expectedReturn}%</p>
                <p className="text-xs text-gray-500 mt-1">{investment.reasoning}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="font-semibold">Category Total: ${investments.reduce((sum, inv) => sum + inv.totalValue, 0).toFixed(2)}</p>
        </div>
      </CardContent>
    </Card>
  );

  // Calculate totals and remaining cash
  const stocksTotal = stockRecommendations.reduce((sum, inv) => sum + inv.totalValue, 0);
  const etfsTotal = etfRecommendations.reduce((sum, inv) => sum + inv.totalValue, 0);
  const bondsTotal = bondRecommendations.reduce((sum, inv) => sum + inv.totalValue, 0);
  
  const cashAllocation = (monthlyAmount * recommendation.asset_allocation.cash_equivalents_percentage) / 100;
  const alternativesAllocation = (monthlyAmount * recommendation.asset_allocation.alternative_investments_percentage) / 100;
  
  const investedTotal = stocksTotal + etfsTotal + bondsTotal;
  const uninvestedCash = monthlyAmount - investedTotal - cashAllocation - alternativesAllocation;

  return (
    <div className="space-y-6">
      {stockRecommendations.length > 0 && renderInvestmentCard("Recommended Stock Investments", stockRecommendations)}
      {etfRecommendations.length > 0 && renderInvestmentCard("Recommended ETFs & Mutual Funds", etfRecommendations)}
      {bondRecommendations.length > 0 && renderInvestmentCard("Recommended Bonds", bondRecommendations)}
      
      <Card>
        <CardHeader>
          <CardTitle>Investment Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p>Total Monthly Investment: ${monthlyAmount.toFixed(2)}</p>
            <p>Total Stocks: ${stocksTotal.toFixed(2)}</p>
            <p>Total ETFs & Funds: ${etfsTotal.toFixed(2)}</p>
            <p>Total Bonds: ${bondsTotal.toFixed(2)}</p>
            <p>Cash Allocation: ${cashAllocation.toFixed(2)}</p>
            <p>Alternatives Allocation: ${alternativesAllocation.toFixed(2)}</p>
            <p>Uninvested Cash: ${uninvestedCash.toFixed(2)}</p>
            <p className="font-bold mt-4 pt-4 border-t">
              Grand Total: ${(investedTotal + cashAllocation + alternativesAllocation).toFixed(2)}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 