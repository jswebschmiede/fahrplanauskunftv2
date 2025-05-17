/**
 * Zeigt Validierungsfehler im Formular an
 * @param {Object} errors - Objekt mit Fehlermeldungen für jedes Feld
 * @returns {void}
 */
export const showValidationErrors = (errors) => {
    // Alle vorherigen Fehlermeldungen entfernen
    document.querySelectorAll('.error-message').forEach(el => el.remove())
    document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error', 'border-red-500'))

    // Für jedes Feld mit Fehler
    Object.entries(errors).forEach(([fieldName, message]) => {
        // Finde das Eingabefeld
        const inputField = document.getElementById(fieldName)
        if (!inputField) return

        // Markiere das Eingabefeld als fehlerhaft
        inputField.classList.add('input-error', 'border-red-500')

        // Erstelle und füge die Fehlermeldung hinzu
        const errorElement = document.createElement('div')
        errorElement.className = 'error-message text-red-500 text-sm mt-1'
        errorElement.textContent = message

        // Füge die Fehlermeldung nach dem Eingabefeld ein
        inputField.parentNode.appendChild(errorElement)
    })
}

/**
 * Entfernt alle Validierungsfehler aus dem Formular
 * @returns {void}
 */
export const clearValidationErrors = () => {
    document.querySelectorAll('.error-message').forEach(el => el.remove())
    document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error', 'border-red-500'))
}

/**
 * Validiert die Eingabefelder spezifisch für die Navigation (Goto-Button)
 * Stellt sicher, dass alle Felder ausgefüllt sind
 * @param {Object} formData - Objekt mit allen Formulardaten (date, time, fromAddress)
 * @returns {Object} Validierungsergebnis mit isValid, errors und firstError Eigenschaften
 */
export const validateNavigation = (formData) => {
    const errors = {}

    // Prüfen, ob eine Adresse eingegeben wurde
    if (!formData.fromAddress || formData.fromAddress.trim() === '') {
        errors.fromAddress = 'Bitte geben Sie eine Startadresse ein'
    }

    // Prüfen, ob ein Datum eingegeben wurde
    if (!formData.date || formData.date.trim() === '') {
        errors.date = 'Bitte wählen Sie ein Datum'
    } else {
        // Wenn ein Datum eingegeben wurde, prüfen ob es gültig ist
        const dateObj = new Date(formData.date)
        if (isNaN(dateObj.getTime())) {
            errors.date = 'Bitte geben Sie ein gültiges Datum ein'
        }
    }

    // Prüfen, ob eine Zeit eingegeben wurde
    if (!formData.time || formData.time.trim() === '') {
        errors.time = 'Bitte wählen Sie eine Uhrzeit'
    } else {
        // Wenn eine Zeit eingegeben wurde, prüfen ob sie dem Format HH:MM entspricht
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
        if (!timeRegex.test(formData.time)) {
            errors.time = 'Bitte geben Sie eine gültige Zeit im Format HH:MM ein'
        }
    }

    // Bestimme, ob das Formular gültig ist
    const isValid = Object.keys(errors).length === 0

    // Gib den ersten Fehler zurück, falls vorhanden
    const firstError = Object.values(errors)[0] || ''

    return {
        isValid,
        errors,
        firstError
    }
} 