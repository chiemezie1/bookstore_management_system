import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { formatDistanceToNow, format, parseISO } from "date-fns"

/**
 * Combines class names with Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a date string to a relative time (e.g., "2 days ago")
 */
export function formatRelativeTime(dateString: string): string {
  const date = parseISO(dateString)
  return formatDistanceToNow(date, { addSuffix: true })
}

/**
 * Formats a date string to a specific format
 */
export function formatDate(dateString: string, formatString = "PPP"): string {
  const date = parseISO(dateString)
  return format(date, formatString)
}

/**
 * Truncates text to a specified length and adds ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + "..."
}

/**
 * Formats a price to a currency string
 */
export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount)
}

/**
 * Generates a random ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

/**
 * Debounces a function
 */
export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout

  return (...args: Parameters<T>): void => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Validates an ISBN
 */
export function isValidISBN(isbn: string): boolean {
  // Remove hyphens and spaces
  isbn = isbn.replace(/[-\s]/g, "")

  // ISBN-10
  if (isbn.length === 10) {
    let sum = 0
    for (let i = 0; i < 9; i++) {
      const digit = Number.parseInt(isbn[i])
      if (isNaN(digit)) return false
      sum += digit * (10 - i)
    }

    // Check digit can be 'X' which equals 10
    const last = isbn[9].toUpperCase()
    if (last === "X") {
      sum += 10
    } else {
      const digit = Number.parseInt(last)
      if (isNaN(digit)) return false
      sum += digit
    }

    return sum % 11 === 0
  }

  // ISBN-13
  if (isbn.length === 13) {
    let sum = 0
    for (let i = 0; i < 12; i++) {
      const digit = Number.parseInt(isbn[i])
      if (isNaN(digit)) return false
      sum += i % 2 === 0 ? digit : digit * 3
    }

    const check = (10 - (sum % 10)) % 10
    return check === Number.parseInt(isbn[12])
  }

  return false
}

