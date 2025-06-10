import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Wallet, Calculator } from "lucide-react";

export function FinancialOverview() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Investment Planning Card */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Investment Planning</CardTitle>
          <LineChart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">Investment Advisor</div>
          <p className="text-xs text-muted-foreground mt-1">
            Get personalized investment recommendations based on your risk profile and goals
          </p>
          <div className="mt-4">
            <Link href="/investment">
              <Button>
                <Wallet className="mr-2 h-4 w-4" />
                View Investment Plan
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Tax Planning Card */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tax Planning</CardTitle>
          <Calculator className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">Tax Advisor</div>
          <p className="text-xs text-muted-foreground mt-1">
            Calculate your taxes and get personalized tax saving recommendations
          </p>
          <div className="mt-4">
            <Link href="/tax-planning">
              <Button>
                <Calculator className="mr-2 h-4 w-4" />
                Plan Your Taxes
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 