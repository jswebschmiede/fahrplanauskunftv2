import './style.css'
import axios from 'axios'
import { formatDateForDeepLink, generateDeepLink, getStopFinderURL, findBestStop, updateLocationsList, debounce } from './utils/utils'
import { validateNavigation, showValidationErrors, clearValidationErrors } from './utils/validate'

// Global state
const toAddress = "Mergelteichstraße 80, 44225 Dortmund";
let destinationId = ""; // Variable to store the destination ID

/**
 * Handles the selection of a location from the results list
 * @param {Object} location - The location object that was selected
 * @param {HTMLElement} listItem - The list item DOM element that was clicked
 * @returns {void}
 */
const handleLocationSelection = (location, listItem) => {
  const fromAddressInput = document.getElementById('fromAddress')
  fromAddressInput.value = location.name

  // Remove selected state from all items
  document.querySelectorAll('.location-item').forEach(item => {
    item.setAttribute('aria-selected', 'false')
    item.classList.remove('bg-blue-50', 'border-blue-500')
    item.classList.add('bg-gray-50', 'border-gray-300')
  })

  // Set selected state for clicked item
  listItem.setAttribute('aria-selected', 'true')
  listItem.classList.remove('bg-gray-50', 'border-gray-300')
  listItem.classList.add('bg-blue-50', 'border-blue-500')
  
  // Clear any validation errors when an option is selected
  clearValidationErrors()
 }

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
 * Handles the search to fetch locations for the entered address
 * @async
 * @returns {Promise<void>}
 */
const handleSearch = async () => {
  // Get form data
  const formData = {
    date: document.getElementById('date').value,
    time: document.getElementById('time').value,
    fromAddress: document.getElementById('fromAddress').value
  }
  
  // Skip search if address is empty
  if (!formData.fromAddress.trim()) {
    return
  }
  
  // Add loading indicator to results
  const results = document.getElementById('results')
  results.innerHTML = '<p class="text-gray-600">Suche läuft...</p>'
  
  try {
    const response = await axios.get(getStopFinderURL(formData.fromAddress))
    console.log('Search results:', response.data)
    
    updateLocationsList(response.data.locations, handleLocationSelection)
    
    // If no results found, show error message
    if (!response.data.locations || response.data.locations.length === 0) {
      results.innerHTML = '<p class="text-amber-500">Keine Haltestellen für diese Adresse gefunden. Bitte versuchen Sie eine andere Adresse.</p>'
    }
  } catch (error) {
    console.error('Error searching:', error)
    results.innerHTML = '<p class="text-red-500">Fehler bei der Suche</p>'
  }
}

/**
 * Debounced version of the search handler
 */
const debouncedSearch = debounce(handleSearch, 500)

/**
 * Handles the goto button click to generate a deep link and open it
 * @returns {void}
 */
const handleNavigation = () => {
  const date = document.getElementById('date').value
  const time = document.getElementById('time').value
  const fromAddress = document.getElementById('fromAddress').value
  
  // Get selected location from data attribute (if any element has aria-selected="true")
  const selectedLocationElement = document.querySelector('.location-item[aria-selected="true"]')
  
  // Validiere alle erforderlichen Felder für die Navigation
  const formData = { 
    date, 
    time, 
    fromAddress,
    selectedLocation: selectedLocationElement ? true : false
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
  
  // Parse die Location-Informationen aus dem data-Attribut
  const locationInfo = JSON.parse(selectedLocationElement.dataset.locationInfo)
  
  // Formatiere das Datum und die Zeit für den Deep Link
  const formattedDate = formatDateForDeepLink(date)
  const formattedTime = time.replace(':', '')
  
  // Generiere den Deep Link
  const deepLink = generateDeepLink(locationInfo.id, formattedDate, formattedTime, destinationId)
  
  // Logge den Deep Link
  console.log('Deep Link:', deepLink)
  
  // Navigiere zum Deep Link in einem neuen Tab
  window.open(deepLink, '_blank')
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
    const fromAddressInput = document.getElementById('fromAddress')
    
    // Add input event listener with debounce for address search
    fromAddressInput.addEventListener('input', debouncedSearch)
    
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