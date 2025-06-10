"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { getTaxAdvice } from "@/actions/tax";
import TaxAdviceDisplay from "./components/TaxAdviceDisplay";

export default function TaxPlanning() {
  const [loading, setLoading] = useState(false);
  const [taxAdvice, setTaxAdvice] = useState(null);
  const [formData, setFormData] = useState({
    financialYear: "",
    salary: "",
    bonuses: "",
    rentalIncome: "",
    otherIncome: "",
    epfContribution: "",
    ppfInvestment: "",
    elssInvestment: "",
    homeLoanInterest: "",
    educationLoanInterest: "",
    medicalInsurance: "",
    npsContribution: "",
    hraReceived: "",
    rentPaid: "",
    cityTier: "metro", // metro, non-metro
    standardDeduction: "50000", // Fixed as per Indian tax laws
    section80C: "", // Total 80C investments excluding EPF/PPF/ELSS
    charityDonations: "",
    savingsBankInterest: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await getTaxAdvice(formData);
      if (result.success) {
        setTaxAdvice(result.data);
        toast.success("Tax analysis generated successfully!");
      } else {
        toast.error(result.error || "Failed to generate tax analysis");
      }
    } catch (error) {
      toast.error("An error occurred while generating the tax analysis");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Income Tax Return Planning</CardTitle>
          <CardDescription>
            Enter your financial details to get personalized tax advice and return estimates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Financial Year */}
              <div className="space-y-2">
                <Label htmlFor="financialYear">Financial Year</Label>
                <Select
                  value={formData.financialYear}
                  onValueChange={(value) => setFormData({ ...formData, financialYear: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Financial Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2023-24">2023-24</SelectItem>
                    <SelectItem value="2024-25">2024-25</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Income Details */}
              <div className="space-y-2">
                <Label htmlFor="salary">Annual Salary</Label>
                <Input
                  id="salary"
                  type="number"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                  placeholder="Enter annual salary"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bonuses">Annual Bonuses</Label>
                <Input
                  id="bonuses"
                  type="number"
                  value={formData.bonuses}
                  onChange={(e) => setFormData({ ...formData, bonuses: e.target.value })}
                  placeholder="Enter annual bonuses"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rentalIncome">Rental Income</Label>
                <Input
                  id="rentalIncome"
                  type="number"
                  value={formData.rentalIncome}
                  onChange={(e) => setFormData({ ...formData, rentalIncome: e.target.value })}
                  placeholder="Enter rental income"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="otherIncome">Other Income</Label>
                <Input
                  id="otherIncome"
                  type="number"
                  value={formData.otherIncome}
                  onChange={(e) => setFormData({ ...formData, otherIncome: e.target.value })}
                  placeholder="Enter other income"
                />
              </div>

              {/* Deductions and Investments */}
              <div className="space-y-2">
                <Label htmlFor="epfContribution">EPF Contribution</Label>
                <Input
                  id="epfContribution"
                  type="number"
                  value={formData.epfContribution}
                  onChange={(e) => setFormData({ ...formData, epfContribution: e.target.value })}
                  placeholder="Enter EPF contribution"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ppfInvestment">PPF Investment</Label>
                <Input
                  id="ppfInvestment"
                  type="number"
                  value={formData.ppfInvestment}
                  onChange={(e) => setFormData({ ...formData, ppfInvestment: e.target.value })}
                  placeholder="Enter PPF investment"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="elssInvestment">ELSS Investment</Label>
                <Input
                  id="elssInvestment"
                  type="number"
                  value={formData.elssInvestment}
                  onChange={(e) => setFormData({ ...formData, elssInvestment: e.target.value })}
                  placeholder="Enter ELSS investment"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="section80C">Other 80C Investments</Label>
                <Input
                  id="section80C"
                  type="number"
                  value={formData.section80C}
                  onChange={(e) => setFormData({ ...formData, section80C: e.target.value })}
                  placeholder="Enter other 80C investments"
                />
              </div>

              {/* Loan Interest */}
              <div className="space-y-2">
                <Label htmlFor="homeLoanInterest">Home Loan Interest</Label>
                <Input
                  id="homeLoanInterest"
                  type="number"
                  value={formData.homeLoanInterest}
                  onChange={(e) => setFormData({ ...formData, homeLoanInterest: e.target.value })}
                  placeholder="Enter home loan interest"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="educationLoanInterest">Education Loan Interest</Label>
                <Input
                  id="educationLoanInterest"
                  type="number"
                  value={formData.educationLoanInterest}
                  onChange={(e) => setFormData({ ...formData, educationLoanInterest: e.target.value })}
                  placeholder="Enter education loan interest"
                />
              </div>

              {/* Insurance and NPS */}
              <div className="space-y-2">
                <Label htmlFor="medicalInsurance">Medical Insurance Premium</Label>
                <Input
                  id="medicalInsurance"
                  type="number"
                  value={formData.medicalInsurance}
                  onChange={(e) => setFormData({ ...formData, medicalInsurance: e.target.value })}
                  placeholder="Enter medical insurance premium"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="npsContribution">NPS Contribution</Label>
                <Input
                  id="npsContribution"
                  type="number"
                  value={formData.npsContribution}
                  onChange={(e) => setFormData({ ...formData, npsContribution: e.target.value })}
                  placeholder="Enter NPS contribution"
                />
              </div>

              {/* HRA Details */}
              <div className="space-y-2">
                <Label htmlFor="hraReceived">HRA Received</Label>
                <Input
                  id="hraReceived"
                  type="number"
                  value={formData.hraReceived}
                  onChange={(e) => setFormData({ ...formData, hraReceived: e.target.value })}
                  placeholder="Enter HRA received"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rentPaid">Annual Rent Paid</Label>
                <Input
                  id="rentPaid"
                  type="number"
                  value={formData.rentPaid}
                  onChange={(e) => setFormData({ ...formData, rentPaid: e.target.value })}
                  placeholder="Enter annual rent paid"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cityTier">City Type</Label>
                <Select
                  value={formData.cityTier}
                  onValueChange={(value) => setFormData({ ...formData, cityTier: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select City Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="metro">Metro City</SelectItem>
                    <SelectItem value="non-metro">Non-Metro City</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Other Deductions */}
              <div className="space-y-2">
                <Label htmlFor="charityDonations">Charity Donations (80G)</Label>
                <Input
                  id="charityDonations"
                  type="number"
                  value={formData.charityDonations}
                  onChange={(e) => setFormData({ ...formData, charityDonations: e.target.value })}
                  placeholder="Enter charity donations"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="savingsBankInterest">Savings Bank Interest</Label>
                <Input
                  id="savingsBankInterest"
                  type="number"
                  value={formData.savingsBankInterest}
                  onChange={(e) => setFormData({ ...formData, savingsBankInterest: e.target.value })}
                  placeholder="Enter savings bank interest"
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Analyzing Tax Details..." : "Get Tax Analysis"}
            </Button>
          </form>

          {taxAdvice && (
            <div className="mt-8">
              <TaxAdviceDisplay taxAdvice={taxAdvice} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 