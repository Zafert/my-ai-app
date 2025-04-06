'use client'

import { useState, useEffect } from "react"
import styles from "./audit.module.css"
import Link from 'next/link'

export default function AuditLogs() {
  const [searches, setSearches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSearchHistory()
  }, [])

  const fetchSearchHistory = async () => {
    try {
      const response = await fetch('/api/searches')
      const data = await response.json()
      setSearches(data)
    } catch (error) {
      console.error('Failed to fetch search history:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <nav className={styles.nav}>
          <Link href="/home" className={styles.link}>Weather</Link>
          <Link href="/audit" className={styles.activeLink}>Audit Logs</Link>
        </nav>
        <h1>Search History</h1>
        {loading ? (
          <p>Loading...</p>
        ) : searches.length > 0 ? (
          <div className={styles.logs}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>City</th>
                  <th>Date</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {searches.map((search) => {
                  const date = new Date(search.createdAt)
                  return (
                    <tr key={search.id}>
                      <td>{search.city}</td>
                      <td>{date.toLocaleDateString()}</td>
                      <td>{date.toLocaleTimeString()}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className={styles.noData}>No search history found</p>
        )}
      </div>
    </main>
  )
} 