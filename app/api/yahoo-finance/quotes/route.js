import { NextResponse } from "next/server";
import yahooFinance from "yahoo-finance2";

export async function POST(req) {
  try {
    const { symbols } = await req.json();

    if (!symbols || !Array.isArray(symbols)) {
      return NextResponse.json(
        { error: "Invalid symbols provided" },
        { status: 400 }
      );
    }

    const quotes = await yahooFinance.quote(symbols, {
      fields: [
        'symbol',
        'longName',
        'shortName',
        'regularMarketPrice',
        'regularMarketChangePercent',
        'fiftyDayAverage',
        'twoHundredDayAverage',
        'regularMarketVolume',
      ],
    });

    // Convert single quote to array if only one symbol was requested
    const quotesArray = Array.isArray(quotes) ? quotes : [quotes];

    return NextResponse.json(quotesArray);
  } catch (error) {
    console.error('Yahoo Finance API Error:', error);
    return NextResponse.json(
      { error: "Failed to fetch market data" },
      { status: 500 }
    );
  }
} 