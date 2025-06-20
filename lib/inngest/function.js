import { inngest } from "./client";
import { db } from "@/lib/prisma";
import EmailTemplate from "@/emails/template";
import { sendEmail } from "@/actions/send-email";
import { GoogleGenerativeAI } from "@google/generative-ai";

// 1. Recurring Transaction Processing with Throttling
export const processRecurringTransaction = inngest.createFunction(
  {
    id: "process-recurring-transaction",
    name: "Process Recurring Transaction",
    throttle: {
      limit: 10, // Process 10 transactions
      period: "1m", // per minute
      key: "event.data.userId", // Throttle per user
    },
  },
  { event: "transaction.recurring.process" },
  async ({ event, step }) => {
    // Validate event data
    if (!event?.data?.transactionId || !event?.data?.userId) {
      console.error("Invalid event data:", event);
      return { error: "Missing required event data" };
    }

    await step.run("process-transaction", async () => {
      const transaction = await db.transaction.findUnique({
        where: {
          id: event.data.transactionId,
          userId: event.data.userId,
        },
        include: {
          account: true,
        },
      });

      if (!transaction || !isTransactionDue(transaction)) return;

      // Create new transaction and update account balance in a transaction
      await db.$transaction(async (tx) => {
        // Create new transaction
        await tx.transaction.create({
          data: {
            type: transaction.type,
            amount: transaction.amount,
            description: `${transaction.description} (Recurring)`,
            date: new Date(),
            category: transaction.category,
            userId: transaction.userId,
            accountId: transaction.accountId,
            isRecurring: false,
          },
        });

        // Update account balance
        const balanceChange =
          transaction.type === "EXPENSE"
            ? -transaction.amount.toNumber()
            : transaction.amount.toNumber();

        await tx.account.update({
          where: { id: transaction.accountId },
          data: { balance: { increment: balanceChange } },
        });

        // Update last processed date and next recurring date
        await tx.transaction.update({
          where: { id: transaction.id },
          data: {
            lastProcessed: new Date(),
            nextRecurringDate: calculateNextRecurringDate(
              new Date(),
              transaction.recurringInterval
            ),
          },
        });
      });
    });
  }
);

// Trigger recurring transactions with batching
export const triggerRecurringTransactions = inngest.createFunction(
  {
    id: "trigger-recurring-transactions", // Unique ID,
    name: "Trigger Recurring Transactions",
  },
  { cron: "0 0 * * *" }, // Daily at midnight
  async ({ step }) => {
    const recurringTransactions = await step.run(
      "fetch-recurring-transactions",
      async () => {
        return await db.transaction.findMany({
          where: {
            isRecurring: true,
            status: "COMPLETED",
            OR: [
              { lastProcessed: null },
              {
                nextRecurringDate: {
                  lte: new Date(),
                },
              },
            ],
          },
        });
      }
    );

    // Send event for each recurring transaction in batches
    if (recurringTransactions.length > 0) {
      const events = recurringTransactions.map((transaction) => ({
        name: "transaction.recurring.process",
        data: {
          transactionId: transaction.id,
          userId: transaction.userId,
        },
      }));

      // Send events directly using inngest.send()
      await inngest.send(events);
    }

    return { triggered: recurringTransactions.length };
  }
);

// 2. Monthly Report Generation
async function generateFinancialInsights(stats, month) {
  // Validate stats data
  if (!stats || typeof stats.totalIncome !== 'number' || typeof stats.totalExpenses !== 'number') {
    console.error("Invalid stats data:", stats);
    return [
      "We couldn't generate detailed insights for this month.",
      "Please ensure your transactions are properly recorded.",
      "Contact support if this issue persists.",
    ];
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    Analyze this financial data and provide 3 concise, actionable insights.
    Focus on spending patterns and practical advice.
    Keep it friendly and conversational.

    Financial Data for ${month}:
    - Total Income: $${stats.totalIncome.toFixed(2)}
    - Total Expenses: $${stats.totalExpenses.toFixed(2)}
    - Net Income: $${(stats.totalIncome - stats.totalExpenses).toFixed(2)}
    - Expense Categories: ${Object.entries(stats.byCategory || {})
      .map(([category, amount]) => `${category}: $${parseFloat(amount).toFixed(2)}`)
      .join(", ")}

    Format the response as a JSON array of strings, like this:
    ["insight 1", "insight 2", "insight 3"]
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

    try {
      const insights = JSON.parse(cleanedText);
      if (Array.isArray(insights) && insights.length > 0) {
        return insights;
      }
      throw new Error("Invalid insights format");
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      throw parseError;
    }
  } catch (error) {
    console.error("Error generating insights:", error);
    return [
      "Your highest expense category this month might need attention.",
      "Consider setting up a budget for better financial management.",
      "Track your recurring expenses to identify potential savings.",
    ];
  }
}

export const generateMonthlyReports = inngest.createFunction(
  {
    id: "generate-monthly-reports",
    name: "Generate Monthly Reports",
  },
  { cron: "59 23 28-31 * *" }, // Run at 23:59 on the last day of every month
  async ({ step }) => {
    let processedCount = 0;
    let errorCount = 0;

    try {
      const users = await step.run("fetch-users", async () => {
        return await db.user.findMany({
          include: { accounts: true },
        });
      });

      // Use current month for the report
      const now = new Date();
      const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      console.log('Generating reports for month:', {
        year: currentMonth.getFullYear(),
        month: currentMonth.getMonth() + 1, // Month is 0-based
        date: currentMonth.toISOString()
      });

      for (const user of users) {
        try {
          await step.run(`generate-report-${user.id}`, async () => {
            const stats = await getMonthlyStats(user.id, currentMonth);
            const monthName = currentMonth.toLocaleString("default", {
              month: "long",
              year: "numeric"
            });

            // Generate AI insights
            const insights = await generateFinancialInsights(stats, monthName);

            // Send email
            const emailResult = await sendEmail({
              to: user.email,
              subject: `Your Monthly Financial Report - ${monthName}`,
              react: EmailTemplate({
                userName: user.name,
                type: "monthly-report",
                data: {
                  stats,
                  month: monthName,
                  insights,
                },
              }),
            });

            if (!emailResult.success) {
              throw new Error(`Failed to send email: ${emailResult.error}`);
            }

            processedCount++;
          });
        } catch (userError) {
          console.error(`Error processing user ${user.id}:`, userError);
          errorCount++;
          continue;
        }
      }

      return {
        processed: processedCount,
        errors: errorCount,
        total: users.length,
      };
    } catch (error) {
      console.error("Error in generateMonthlyReports:", error);
      return {
        processed: processedCount,
        errors: errorCount + (users?.length || 0) - processedCount,
        total: users?.length || 0,
        error: error.message,
      };
    }
  }
);

// 3. Budget Alerts with Event Batching
export const checkBudgetAlerts = inngest.createFunction(
  { name: "Check Budget Alerts" },
  { cron: "0 */6 * * *" }, // Every 6 hours
  async ({ step }) => {
    const budgets = await step.run("fetch-budgets", async () => {
      return await db.budget.findMany({
        include: {
          user: {
            include: {
              accounts: {
                where: {
                  isDefault: true,
                },
              },
            },
          },
        },
      });
    });

    for (const budget of budgets) {
      const defaultAccount = budget.user.accounts[0];
      if (!defaultAccount) continue; // Skip if no default account

      await step.run(`check-budget-${budget.id}`, async () => {
        const startDate = new Date();
        startDate.setDate(1); // Start of current month

        // Calculate total expenses for the default account only
        const expenses = await db.transaction.aggregate({
          where: {
            userId: budget.userId,
            accountId: defaultAccount.id, // Only consider default account
            type: "EXPENSE",
            date: {
              gte: startDate,
            },
          },
          _sum: {
            amount: true,
          },
        });

        const totalExpenses = expenses._sum.amount?.toNumber() || 0;
        const budgetAmount = budget.amount;
        const percentageUsed = (totalExpenses / budgetAmount) * 100;

        // Check if we should send an alert
        // if (
        //   percentageUsed >= 80 && // Default threshold of 80%
        //   (!budget.lastAlertSent ||
        //     isNewMonth(new Date(budget.lastAlertSent), new Date()))
        // ) 
        if (
          percentageUsed >= 80 
        ) 
        {
          await sendEmail({
            to: budget.user.email,
            subject: `Budget Alert for ${defaultAccount.name}`,
            react: EmailTemplate({
              userName: budget.user.name,
              type: "budget-alert",
              data: {
                percentageUsed,
                budgetAmount: parseInt(budgetAmount).toFixed(1),
                totalExpenses: parseInt(totalExpenses).toFixed(1),
                accountName: defaultAccount.name,
              },
            }),
          });

          // Update last alert sent
          await db.budget.update({
            where: { id: budget.id },
            data: { lastAlertSent: new Date() },
          });
        }
      });
    }
  }
);

function isNewMonth(lastAlertDate, currentDate) {
  return (
    lastAlertDate.getMonth() !== currentDate.getMonth() ||
    lastAlertDate.getFullYear() !== currentDate.getFullYear()
  );
}

// Utility functions
function isTransactionDue(transaction) {
  // If no lastProcessed date, transaction is due
  if (!transaction.lastProcessed) return true;

  const today = new Date();
  const nextDue = new Date(transaction.nextRecurringDate);

  // Compare with nextDue date
  return nextDue <= today;
}

function calculateNextRecurringDate(date, interval) {
  const next = new Date(date);
  switch (interval) {
    case "DAILY":
      next.setDate(next.getDate() + 1);
      break;
    case "WEEKLY":
      next.setDate(next.getDate() + 7);
      break;
    case "MONTHLY":
      next.setMonth(next.getMonth() + 1);
      break;
    case "YEARLY":
      next.setFullYear(next.getFullYear() + 1);
      break;
  }
  return next;
}

async function getMonthlyStats(userId, month) {
  // Ensure we're working with the first day of the month
  const startDate = new Date(month.getFullYear(), month.getMonth(), 1);
  // Get the last day of the month by going to the first day of next month and subtracting one day
  const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0, 23, 59, 59, 999);

  try {
    console.log(`Fetching stats for user ${userId} for ${startDate.toLocaleString('default', { month: 'long', year: 'numeric' })}`, {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });

    // Get all transactions for the user across all accounts
    const transactions = await db.transaction.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
        status: "COMPLETED", // Only include completed transactions
      },
      include: {
        account: true, // Include account details for debugging
      },
      orderBy: {
        date: 'asc' // Order by date for consistent processing
      }
    });

    console.log(`Found ${transactions.length} transactions in date range`);

    const stats = transactions.reduce(
      (stats, t) => {
        try {
          // Ensure amount is properly converted to number
          const amount = parseFloat(t.amount.toString());
          
          if (isNaN(amount)) {
            console.error(`Invalid amount for transaction ${t.id}:`, t.amount);
            return stats;
          }

          console.log(`Processing transaction: ${t.id}, date: ${t.date.toISOString()}, type: ${t.type}, amount: ${amount}, category: ${t.category}, account: ${t.account.name}`);

          if (t.type === "EXPENSE") {
            stats.totalExpenses += amount;
            stats.byCategory[t.category] = (stats.byCategory[t.category] || 0) + amount;
          } else if (t.type === "INCOME") {
            stats.totalIncome += amount;
          }
        } catch (error) {
          console.error(`Error processing transaction ${t.id}:`, error, t);
        }
        return stats;
      },
      {
        totalExpenses: 0,
        totalIncome: 0,
        byCategory: {},
        transactionCount: transactions.length,
      }
    );

    console.log('Final stats:', {
      month: startDate.toLocaleString('default', { month: 'long', year: 'numeric' }),
      totalIncome: stats.totalIncome,
      totalExpenses: stats.totalExpenses,
      categories: Object.keys(stats.byCategory),
      transactionCount: stats.transactionCount
    });

    return stats;
  } catch (error) {
    console.error("Error in getMonthlyStats:", error);
    return {
      totalExpenses: 0,
      totalIncome: 0,
      byCategory: {},
      transactionCount: 0,
    };
  }
}
