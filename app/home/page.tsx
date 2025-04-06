'use client'

import { useState } from "react"
import styles from "./page.module.css"

export default function Home() {
  const [city, setCity] = useState("")
  const [weather, setWeather] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const getWeather = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await fetch(`/api/weather?city=${city}`)
      const data = await response.json()
      setWeather(data)
    } catch (error) {
      console.error(error)
    }
    setLoading(false)
  }

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1>Weather App</h1>
        <form onSubmit={getWeather} className={styles.form}>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter city name"
            className={styles.input}
          />
          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? "Loading..." : "Get Weather"}
          </button>
        </form>

        {weather && (
          <div className={styles.weather}>
            <h2>{weather.location.name}, {weather.location.country}</h2>
            <p>Temperature: {weather.current.temp_c}°C</p>
            <p>Condition: {weather.current.condition.text}</p>
            <img src={weather.current.condition.icon} alt={weather.current.condition.text} />
          </div>
        )}
      </div>
    </main>
  )
} 