/**
 * Formats a date string into the DDMMYYYY format required for the deep link
 * @param {string} dateStr - Date string in ISO format (YYYY-MM-DD)
 * @returns {string} Formatted date string (DDMMYYYY)
 */
export const formatDateForDeepLink = (dateStr) => {
    const date = new Date(dateStr)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return day + month + year
  }
  
  /**
   * Generates a deep link URL for journey planning
   * @param {string} originId - The ID of the origin station
   * @param {string} date - Date in DDMMYYYY format
   * @param {string} time - Time in HHmm format (24h)
   * @param {string} destId - The ID of the destination station
   * @returns {string} Fully formatted and encoded deep link URL
   */
  export const generateDeepLink = (originId, date, time, destId) => {
    // Use the provided destination ID or fallback to an example
    const destinationId = destId || "de:05978:11186"
    
    // Create the parameters object
    const params = {
      destination: destinationId,
      itdDateDayMonthYear: date,
      itdTime: time,
      origin: originId
    }
    
    // Create the formik parameter by encoding each parameter
    const formik = Object.entries(params)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&')
    
    // Return the complete URL
    return `https://www.westfalenfahrplan.de/nwlsl3+/trip?formik=${encodeURIComponent(formik)}&lng=de&sharedLink=true`
  }

  /**
   * Generates the URL for the StopFinder API
   * @param {string} address - The address or station name to search for
   * @returns {string} Complete URL for the StopFinder API request
   */
  export const getStopFinderURL = (address) => {
    return `https://www.westfalenfahrplan.de/nwl-efa/XML_STOPFINDER_REQUEST?coordOutputFormat=WGS84%5Bdd.ddddd%5D&language=de&locationInfoActive=1&locationServerActive=1&name_sf=${address}&nwlStopFinderMacro=1&outputFormat=rapidJSON&serverInfo=1&sl3plusStopFinderMacro=1&type_sf=any&version=10.4.18.18`
  }

  /**
   * Finds the best stop from a list of locations
   * @param {Array} locations - Array of location objects from the API response
   * @returns {Object|null} The best location object or null if no locations
   */
  export const findBestStop = (locations) => {
    if (!locations || locations.length === 0) {
      return null
    }
    
    return locations.find(loc => loc.isBest) || locations[0]
  }

  /**
   * Updates the locations list in the DOM with search results
   * @param {Array} locations - Array of location objects from the API response
   * @param {Function} onLocationClick - Callback function when a location is clicked
   * @returns {void}
   */
  export const updateLocationsList = (locations, onLocationClick) => {
    const results = document.getElementById('results')
    results.innerHTML = '' // Clear previous results

    if (locations && locations.length > 0) {
      const ul = document.createElement('ul')
      ul.className = 'space-y-2'
      // Add ARIA role for better accessibility
      ul.setAttribute('role', 'listbox')
      ul.setAttribute('aria-label', 'Gefundene Haltestellen')

      locations.forEach((location, index) => {
        const li = document.createElement('li')
        // Make the li element focusable and tabbable
        li.setAttribute('tabindex', '0')
        li.setAttribute('role', 'option')
        li.setAttribute('aria-selected', 'false')
        li.className = 'location-item p-3 border border-gray-300 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-blue-50'
        li.textContent = location.name
        
        // Add data attributes
        li.dataset.locationInfo = JSON.stringify({
          name: location.name,
          id: location.id,
          coord: location.coord
        })

        // Add click event listener
        li.addEventListener('click', () => {
          onLocationClick(location, li)
        })

        // Add keyboard event listener for Enter key only
        li.addEventListener('keydown', (e) => {
          // Enter key selects the location
          if (e.key === 'Enter') {
            e.preventDefault()
            onLocationClick(location, li)
          }
        })

        ul.appendChild(li)
      })

      results.appendChild(ul)
      
      // Don't automatically focus the first item - let normal tab flow work
    } else {
      results.innerHTML = '<p class="text-gray-500">Keine Ergebnisse gefunden</p>'
    }
  }

  /**
   * Implementiert die Debounce-Funktion für verzögertes Ausführen von Funktionen
   * @param {Function} func - Die auszuführende Funktion
   * @param {number} wait - Die Verzögerungszeit in Millisekunden
   * @returns {Function} - Die debounced Funktion
   */
  export const debounce = (func, wait) => {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }