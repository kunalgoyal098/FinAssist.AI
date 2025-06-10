"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getInvestmentRecommendation } from "@/actions/investment";
import { toast } from "sonner";
import InvestmentDetails from "./components/InvestmentDetails";

export default function InvestmentRecommendation() {
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const [formData, setFormData] = useState({
    age: "",
    monthlySalary: "",
    monthlyExpenses: "",
    emiAmount: "",
    emiDuration: "",
    otherLiabilities: "",
    riskPreference: 5,
    investmentHorizon: "",
    financialGoals: "",
    userLocation: "",
    existingInvestments: "",
    dependents: "",
    taxBracket: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await getInvestmentRecommendation(formData);
      console.log(result)
      if (result.success) {
        setRecommendation(result.data);
        toast.success("Investment recommendation generated successfully!");
      } else {
        toast.error(result.error || "Failed to generate recommendation");
      }
    } catch (error) {
      toast.error("An error occurred while generating the recommendation");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Investment Recommendation</CardTitle>
          <CardDescription>
            Fill in your details to get personalized investment recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Age */}
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  placeholder="Enter your age"
                  required
                />
              </div>

              {/* Monthly Salary */}
              <div className="space-y-2">
                <Label htmlFor="monthlySalary">Monthly Salary ($)</Label>
                <Input
                  id="monthlySalary"
                  type="number"
                  value={formData.monthlySalary}
                  onChange={(e) => setFormData({ ...formData, monthlySalary: e.target.value })}
                  placeholder="Enter your monthly salary"
                  required
                />
              </div>

              {/* Monthly Expenses */}
              <div className="space-y-2">
                <Label htmlFor="monthlyExpenses">Monthly Expenses ($)</Label>
                <Input
                  id="monthlyExpenses"
                  type="number"
                  value={formData.monthlyExpenses}
                  onChange={(e) => setFormData({ ...formData, monthlyExpenses: e.target.value })}
                  placeholder="Enter your monthly expenses"
                  required
                />
              </div>

              {/* EMI Amount */}
              <div className="space-y-2">
                <Label htmlFor="emiAmount">Monthly EMI Amount ($)</Label>
                <Input
                  id="emiAmount"
                  type="number"
                  value={formData.emiAmount}
                  onChange={(e) => setFormData({ ...formData, emiAmount: e.target.value })}
                  placeholder="Enter your monthly EMI amount"
                />
              </div>

              {/* EMI Duration */}
              <div className="space-y-2">
                <Label htmlFor="emiDuration">EMI Duration (months)</Label>
                <Input
                  id="emiDuration"
                  type="number"
                  value={formData.emiDuration}
                  onChange={(e) => setFormData({ ...formData, emiDuration: e.target.value })}
                  placeholder="Enter remaining EMI duration"
                />
              </div>

              {/* Other Liabilities */}
              <div className="space-y-2">
                <Label htmlFor="otherLiabilities">Other Liabilities ($)</Label>
                <Input
                  id="otherLiabilities"
                  type="number"
                  value={formData.otherLiabilities}
                  onChange={(e) => setFormData({ ...formData, otherLiabilities: e.target.value })}
                  placeholder="Enter other liabilities"
                />
              </div>

              {/* Risk Preference */}
              <div className="space-y-2">
                <Label>Risk Preference (1-10)</Label>
                <Slider
                  value={[formData.riskPreference]}
                  onValueChange={(value) => setFormData({ ...formData, riskPreference: value[0] })}
                  max={10}
                  min={1}
                  step={1}
                />
                <div className="text-sm text-gray-500">Current: {formData.riskPreference}</div>
              </div>

              {/* Investment Horizon */}
              <div className="space-y-2">
                <Label htmlFor="investmentHorizon">Investment Horizon (years)</Label>
                <Input
                  id="investmentHorizon"
                  type="number"
                  value={formData.investmentHorizon}
                  onChange={(e) => setFormData({ ...formData, investmentHorizon: e.target.value })}
                  placeholder="Enter investment horizon in years"
                  required
                />
              </div>

              {/* Financial Goals */}
              <div className="space-y-2">
                <Label htmlFor="financialGoals">Financial Goals</Label>
                <Textarea
                  id="financialGoals"
                  value={formData.financialGoals}
                  onChange={(e) => setFormData({ ...formData, financialGoals: e.target.value })}
                  placeholder="Describe your financial goals"
                  required
                />
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="userLocation">Location</Label>
                <Input
                  id="userLocation"
                  value={formData.userLocation}
                  onChange={(e) => setFormData({ ...formData, userLocation: e.target.value })}
                  placeholder="Enter your location"
                  required
                />
              </div>

              {/* Existing Investments */}
              <div className="space-y-2">
                <Label htmlFor="existingInvestments">Existing Investments</Label>
                <Textarea
                  id="existingInvestments"
                  value={formData.existingInvestments}
                  onChange={(e) => setFormData({ ...formData, existingInvestments: e.target.value })}
                  placeholder="Describe your existing investments"
                />
              </div>

              {/* Dependents */}
              <div className="space-y-2">
                <Label htmlFor="dependents">Number of Dependents</Label>
                <Input
                  id="dependents"
                  type="number"
                  value={formData.dependents}
                  onChange={(e) => setFormData({ ...formData, dependents: e.target.value })}
                  placeholder="Enter number of dependents"
                />
              </div>

              {/* Tax Bracket */}
              <div className="space-y-2">
                <Label htmlFor="taxBracket">Tax Bracket (%)</Label>
                <Input
                  id="taxBracket"
                  type="number"
                  value={formData.taxBracket}
                  onChange={(e) => setFormData({ ...formData, taxBracket: e.target.value })}
                  placeholder="Enter your tax bracket percentage"
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Generating Recommendation..." : "Get Investment Recommendations"}
            </Button>
          </form>

          {recommendation && (
            <div className="mt-8 space-y-6">
              <h3 className="text-xl font-semibold">Your Investment Recommendation</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Investment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">${recommendation.monthly_investment_recommendation.amount}</p>
                    <p className="text-sm text-gray-500">{recommendation.monthly_investment_recommendation.reasoning}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Risk Assessment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{recommendation.risk_assessment.risk_level}/10</p>
                    <p className="text-sm text-gray-500">{recommendation.risk_assessment.reasoning}</p>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Asset Allocation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div>
                        <p className="font-semibold">Stocks</p>
                        <p className="text-2xl">{recommendation.asset_allocation.stocks_percentage}%</p>
                      </div>
                      <div>
                        <p className="font-semibold">Mutual Funds & ETFs</p>
                        <p className="text-2xl">{recommendation.asset_allocation.mutual_funds_etfs_percentage}%</p>
                      </div>
                      <div>
                        <p className="font-semibold">Bonds</p>
                        <p className="text-2xl">{recommendation.asset_allocation.bonds_percentage}%</p>
                      </div>
                      <div>
                        <p className="font-semibold">Cash</p>
                        <p className="text-2xl">{recommendation.asset_allocation.cash_equivalents_percentage}%</p>
                      </div>
                      <div>
                        <p className="font-semibold">Alternatives</p>
                        <p className="text-2xl">{recommendation.asset_allocation.alternative_investments_percentage}%</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-4">{recommendation.asset_allocation.reasoning}</p>
                  </CardContent>
                </Card>

                <div className="md:col-span-2">
                  <InvestmentDetails 
                    recommendation={recommendation} 
                    monthlyAmount={recommendation.monthly_investment_recommendation.amount}
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 