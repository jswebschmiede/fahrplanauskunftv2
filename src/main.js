import './style.css'
import axios from 'axios'
import { formatDateForDeepLink, generateDeepLink, getStopFinderURL, findBestStop } from './utils/utils'
import { validateNavigation, showValidationErrors, clearValidationErrors } from './utils/validate'

// Global state
const toAddress = "Mergelteichstraße 80, 44225 Dortmund";
let destinationId = "";

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
    const results = document.getElementById('results')

    const formData = {
        date,
        time,
        fromAddress
    }

    const validation = validateNavigation(formData)

    if (!validation.isValid) {
        showValidationErrors(validation.errors)
        return
    }
    clearValidationErrors()

    loadingSpinner.classList.remove('hidden')
    buttonText.classList.add('hidden')
    buttonIcon.classList.add('hidden')
    gotoButton.disabled = true

    try {
        const response = await axios.get(getStopFinderURL(fromAddress))

        loadingSpinner.classList.add('hidden')
        buttonText.classList.remove('hidden')
        buttonIcon.classList.remove('hidden')
        gotoButton.disabled = false

        if (!response.data.locations || response.data.locations.length === 0) {
            results.innerHTML = '<p class="text-amber-500">Keine Adresse gefunden. Bitte versuchen Sie eine andere Adresse.</p>'
            return
        }

        const bestLocation = findBestStop(response.data.locations)

        const formattedDate = formatDateForDeepLink(date)
        const formattedTime = time.replace(':', '')

        const deepLink = generateDeepLink(bestLocation.id, formattedDate, formattedTime, destinationId)

        console.log('Deep Link:', deepLink)

        window.open(deepLink, '_blank')

    } catch (error) {
        console.error('Error searching:', error)
        results.innerHTML = '<p class="text-red-500">Fehler bei der Suche nach Haltestellen</p>'

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
    fetchInitialData()

    document.addEventListener('DOMContentLoaded', () => {
        const gotoButton = document.getElementById('gotoButton')

        gotoButton.addEventListener('click', handleNavigation)

        const inputs = document.querySelectorAll('input')
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                input.classList.remove('input-error', 'border-red-500')
                const errorEl = input.parentNode.querySelector('.error-message')
                if (errorEl) errorEl.remove()
            })
        })
    })
}

initApp()