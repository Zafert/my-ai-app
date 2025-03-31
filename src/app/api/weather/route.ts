import { NextResponse } from 'next/server';

const WEATHER_API_KEY = process.env.WEATHER_API_KEY;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city') || 'London';

  try {
    const res = await fetch(
      `http://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${city}&aqi=no`
    );
    const data = await res.json();
    
    return NextResponse.json({
      city: data.location.name,
      country: data.location.country,
      condition: data.current.condition.text,
      isDay: data.current.is_day,
      temperature: data.current.temp_c,
      feelsLike: data.current.feelslike_c,
      humidity: data.current.humidity,
      windSpeed: data.current.wind_kph,
      windDirection: data.current.wind_dir,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch weather' }, { status: 500 });
  }
} 