import './style.css'
import axios from 'axios'
import { formatDateForDeepLink, generateDeepLink, getStopFinderURL, findBestStop } from './utils/utils'
import { validateNavigation, showValidationErrors, clearValidationErrors } from './utils/validate'

// Global state
const toAddress = "Mergelteichstraße 80, 44225 Dortmund";
let destinationId = ""; // Variable to store the destination ID

/**
 * Fetches initial data for the destination address
 * @async
 * @returns {Promise<void>}
 */
const fetchInitialData = async () => {
    try {
        const toAddressElement = document.getElementById('toAddress')
        toAddressElement.textContent = toAddress

        const response = await axios.get(getStopFinderURL(toAddress))

        const bestStopElement = document.getElementById('bestStop')
        if (response.data.locations && response.data.locations.length > 0) {
            const bestStop = findBestStop(response.data.locations)
            bestStopElement.textContent = bestStop.name + " - (" + bestStop.coord[0] + ", " + bestStop.coord[1] + ")"

            // Store the destination ID
            destinationId = bestStop.id
        } else {
            bestStopElement.textContent = 'Keine Koordinaten gefunden'
        }

        console.log('Initial data fetched:', response.data)

    } catch (error) {
        console.error('Error fetching initial data:', error)
    }
}

/**
 * Handles the goto button click to generate a deep link and open it
 * @returns {void}
 */
const handleNavigation = async () => {
    const date = document.getElementById('date').value
    const time = document.getElementById('time').value
    const fromAddress = document.getElementById('fromAddress').value
    const gotoButton = document.getElementById('gotoButton')
    const loadingSpinner = document.getElementById('loadingSpinner')
    const buttonText = document.getElementById('buttonText')
    const buttonIcon = document.getElementById('buttonIcon')

    // Validiere alle erforderlichen Felder für die Navigation
    const formData = {
        date,
        time,
        fromAddress
    }

    // Validiere die Formulardaten mit der Navigation-Validierung
    const validation = validateNavigation(formData)

    // Zeige Validierungsfehler an, falls vorhanden
    if (!validation.isValid) {
        showValidationErrors(validation.errors)
        return
    }

    // Lösche alle Validierungsfehler
    clearValidationErrors()

    // Zeige Ladeanzeige im Results-Bereich
    const results = document.getElementById('results')

    // Button in Loading-Status versetzen
    loadingSpinner.classList.remove('hidden')
    buttonText.classList.add('hidden')
    buttonIcon.classList.add('hidden')
    gotoButton.disabled = true

    try {
        // Lade Haltestellen für die eingegebene Adresse
        const response = await axios.get(getStopFinderURL(fromAddress))

        // Button zurücksetzen
        loadingSpinner.classList.add('hidden')
        buttonText.classList.remove('hidden')
        buttonIcon.classList.remove('hidden')
        gotoButton.disabled = false


        if (!response.data.locations || response.data.locations.length === 0) {
            results.innerHTML = '<p class="text-amber-500">Keine Adresse gefunden. Bitte versuchen Sie eine andere Adresse.</p>'
            return
        }

        // Finde die beste Haltestelle
        const bestLocation = findBestStop(response.data.locations)


        // Formatiere das Datum und die Zeit für den Deep Link
        const formattedDate = formatDateForDeepLink(date)
        const formattedTime = time.replace(':', '')

        // Generiere den Deep Link
        const deepLink = generateDeepLink(bestLocation.id, formattedDate, formattedTime, destinationId)

        // Logge den Deep Link
        console.log('Deep Link:', deepLink)

        // Navigiere zum Deep Link in einem neuen Tab
        window.open(deepLink, '_blank')

    } catch (error) {
        console.error('Error searching:', error)
        results.innerHTML = '<p class="text-red-500">Fehler bei der Suche nach Haltestellen</p>'

        // Button zurücksetzen im Fehlerfall
        loadingSpinner.classList.add('hidden')
        buttonText.classList.remove('hidden')
        buttonIcon.classList.remove('hidden')
        gotoButton.disabled = false
    }
}

/**
 * Initializes the application
 * @returns {void}
 */
const initApp = () => {
    // Fetch initial data
    fetchInitialData()

    // Add event listeners
    document.addEventListener('DOMContentLoaded', () => {
        const gotoButton = document.getElementById('gotoButton')

        // Add navigation button event listener
        gotoButton.addEventListener('click', handleNavigation)

        // Add input event listeners to clear validation errors when typing
        const inputs = document.querySelectorAll('input')
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                // Remove error styling for this specific input
                input.classList.remove('input-error', 'border-red-500')
                // Remove error message if it exists
                const errorEl = input.parentNode.querySelector('.error-message')
                if (errorEl) errorEl.remove()
            })
        })
    })
}

// Start the app
initApp()