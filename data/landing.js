import {
  BarChart3,
  Receipt,
  PieChart,
  CreditCard,
  LineChart,
  Calculator,
} from "lucide-react";

// Stats Data
export const statsData = [
  {
    value: "3",
    label: "Active Users",
  },
  {
    value: "100+",
    label: "Transactions Tracked",
  },
  {
    value: "90%",
    label: "Uptime",
  },
  {
    value: "4.9/5",
    label: "User Rating",
  },
];

// Features Data
export const featuresData = [
  {
    icon: <BarChart3 className="h-8 w-8 text-blue-600" />,
    title: "Advanced Analytics",
    description:
      "Get detailed insights into your spending patterns with AI-powered analytics",
  },
  {
    icon: <Receipt className="h-8 w-8 text-blue-600" />,
    title: "Smart Receipt Scanner",
    description:
      "Extract data automatically from receipts using advanced AI technology",
  },
  {
    icon: <PieChart className="h-8 w-8 text-blue-600" />,
    title: "Budget Planning",
    description: "Create and manage budgets with intelligent recommendations",
  },
  {
    icon: <CreditCard className="h-8 w-8 text-blue-600" />,
    title: "Multi-Account Support",
    description: "Manage multiple accounts and credit cards in one place",
  },
  {
    icon: <LineChart className="h-8 w-8 text-blue-600" />,
    title: "Investment Portfolio",
    description: "Get personalized investment recommendations and portfolio management",
  },
  {
    icon: <Calculator className="h-8 w-8 text-blue-600" />,
    title: "Income Tax Planning",
    description: "Plan your taxes efficiently with AI-powered recommendations",
  },
];

// How It Works Data
export const howItWorksData = [
  {
    icon: <CreditCard className="h-8 w-8 text-blue-600" />,
    title: "1. Create Your Account",
    description:
      "Get started in minutes with our simple and secure sign-up process",
  },
  {
    icon: <BarChart3 className="h-8 w-8 text-blue-600" />,
    title: "2. Track Your Spending",
    description:
      "Automatically categorize and track your transactions in real-time",
  },
  {
    icon: <PieChart className="h-8 w-8 text-blue-600" />,
    title: "3. Get Insights",
    description:
      "Receive AI-powered insights and recommendations to optimize your finances",
  },
];

// Testimonials Data
export const testimonialsData = [
  {
    name: "Tanishq Praveen",
    role: "student",
    image: "/tanishq.jpg",
    quote:
      "I have used this product on the say of my friends and i really found it useful as it helped to manage my finances.",
  },
  {
    name: "Siddharth Pappani",
    role: "Freelancer",
    image: "/sid.jpg",
    quote:
      "As a freelancer, a lot of times I had to put my bills and earnings in my one place to track my financial goals and this app can help a lot at this place.",
  },
  {
    name: "Jishnu Phani",
    role: " Student&Trader",
    image: "/jish.jpg",
    quote:
      "I recommend FinAssist.ai to all people to use as this can be a great tool to grab good investment oppotunities",
  },
];
