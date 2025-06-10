"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function TaxAdviceDisplay({ taxAdvice }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Income Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Income Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Gross Income</h4>
                <p className="text-2xl font-bold">{formatCurrency(taxAdvice.gross_income.total)}</p>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Salary</span>
                    <span>{formatCurrency(taxAdvice.gross_income.breakdown.salary)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>HRA Exemption</span>
                    <span>{formatCurrency(taxAdvice.gross_income.breakdown.hra_exemption)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Rental Income</span>
                    <span>{formatCurrency(taxAdvice.gross_income.breakdown.rental_income)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Other Income</span>
                    <span>{formatCurrency(taxAdvice.gross_income.breakdown.other_income)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Savings Interest</span>
                    <span>{formatCurrency(taxAdvice.gross_income.breakdown.savings_interest)}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Deductions</h4>
                <p className="text-2xl font-bold">{formatCurrency(taxAdvice.deductions.total)}</p>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Section 80C</span>
                    <span>{formatCurrency(taxAdvice.deductions.breakdown.section_80C.eligible_amount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Section 80D</span>
                    <span>{formatCurrency(taxAdvice.deductions.breakdown.section_80D)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Section 80CCD (NPS)</span>
                    <span>{formatCurrency(taxAdvice.deductions.breakdown.section_80CCD)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Home Loan Interest</span>
                    <span>{formatCurrency(taxAdvice.deductions.breakdown.section_24)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Education Loan</span>
                    <span>{formatCurrency(taxAdvice.deductions.breakdown.section_80E)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tax Computation */}
      <Card>
        <CardHeader>
          <CardTitle>Tax Computation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold">Old Tax Regime</h4>
              <div className="p-4 border rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span>Tax Amount</span>
                  <span>{formatCurrency(taxAdvice.tax_computation.tax_old_regime.tax_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Surcharge</span>
                  <span>{formatCurrency(taxAdvice.tax_computation.tax_old_regime.surcharge)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cess</span>
                  <span>{formatCurrency(taxAdvice.tax_computation.tax_old_regime.cess)}</span>
                </div>
                <div className="flex justify-between font-bold pt-2 border-t">
                  <span>Total Tax</span>
                  <span>{formatCurrency(taxAdvice.tax_computation.tax_old_regime.total_tax)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">New Tax Regime</h4>
              <div className="p-4 border rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span>Tax Amount</span>
                  <span>{formatCurrency(taxAdvice.tax_computation.tax_new_regime.tax_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Surcharge</span>
                  <span>{formatCurrency(taxAdvice.tax_computation.tax_new_regime.surcharge)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cess</span>
                  <span>{formatCurrency(taxAdvice.tax_computation.tax_new_regime.cess)}</span>
                </div>
                <div className="flex justify-between font-bold pt-2 border-t">
                  <span>Total Tax</span>
                  <span>{formatCurrency(taxAdvice.tax_computation.tax_new_regime.total_tax)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold">Recommended Tax Regime</h4>
                <p className="text-sm text-gray-500">Based on your income and deductions</p>
              </div>
              <Badge variant={taxAdvice.tax_computation.recommended_regime === 'old' ? 'default' : 'secondary'}>
                {taxAdvice.tax_computation.recommended_regime.toUpperCase()} Regime
              </Badge>
            </div>
            <div className="mt-4">
              <p className="text-sm">Potential Tax Savings: {formatCurrency(taxAdvice.tax_computation.tax_savings)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tax Saving Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Tax Saving Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {taxAdvice.tax_saving_recommendations.map((recommendation, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold">{recommendation.category}</h4>
                    <p className="text-sm text-gray-500 mt-1">{recommendation.reasoning}</p>
                  </div>
                  <Badge variant="outline">
                    Save {formatCurrency(recommendation.additional_tax_saving)}
                  </Badge>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Current Investment</span>
                    <span>{formatCurrency(recommendation.current_investment)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Recommended Investment</span>
                    <span>{formatCurrency(recommendation.recommended_investment)}</span>
                  </div>
                  <Progress 
                    value={(recommendation.current_investment / recommendation.recommended_investment) * 100} 
                    className="mt-2"
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Tax Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 border rounded-lg">
              <h4 className="text-sm text-gray-500">Total Tax Payable</h4>
              <p className="text-2xl font-bold">{formatCurrency(taxAdvice.summary.total_tax_payable)}</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="text-sm text-gray-500">Monthly Tax Liability</h4>
              <p className="text-2xl font-bold">{formatCurrency(taxAdvice.summary.monthly_tax_liability)}</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="text-sm text-gray-500">Effective Tax Rate</h4>
              <p className="text-2xl font-bold">{taxAdvice.summary.effective_tax_rate.toFixed(1)}%</p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">Key Points</h4>
            <ul className="list-disc list-inside space-y-2">
              {taxAdvice.summary.key_points.map((point, index) => (
                <li key={index} className="text-sm">{point}</li>
              ))}
            </ul>
          </div>

          <div className="mt-6">
            <h4 className="font-semibold mb-2">Compliance Notes</h4>
            <ul className="list-disc list-inside space-y-2">
              {taxAdvice.compliance_notes.map((note, index) => (
                <li key={index} className="text-sm text-gray-600">{note}</li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 