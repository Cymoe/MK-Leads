import { useState, useEffect, useRef, useCallback } from 'react'
import { MapPin, Loader, Check } from 'lucide-react'
import { supabase } from '../lib/supabase'
import './CityAutocomplete.css'

function CityAutocomplete({ 
  value, 
  state, 
  onChange, 
  onSelect,
  placeholder = "Search for a city...",
  allowCustom = true 
}) {
  const [inputValue, setInputValue] = useState(value || '')
  const [suggestions, setSuggestions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 })
  const dropdownRef = useRef(null)
  const inputRef = useRef(null)

  // Load initial value if provided
  useEffect(() => {
    setInputValue(value || '')
  }, [value])

  // Function to update dropdown position
  const updateDropdownPosition = useCallback(() => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect()
      setDropdownPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width
      })
    }
  }, [])

  // Close dropdown when clicking outside and handle window resize
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }

    const handleResize = () => {
      if (showDropdown) {
        updateDropdownPosition()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    window.addEventListener('resize', handleResize)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('resize', handleResize)
    }
  }, [showDropdown, updateDropdownPosition])

  // Load initial cities for a state (most popular cities)
  const loadInitialCities = useCallback(async (searchState) => {
    if (!searchState) {
      setSuggestions([])
      return
    }

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('canonical_cities')
        .select('*')
        .eq('state', searchState)
        .order('population', { ascending: false })
        .limit(15) // Show more cities initially

      if (error) throw error

      setSuggestions(data || [])
      updateDropdownPosition()
      setShowDropdown(true)
    } catch (error) {
      console.error('Error loading cities:', error)
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Search for cities
  const searchCities = useCallback(async (searchTerm, searchState) => {
    // Don't search if no state is selected
    if (!searchState) {
      setSuggestions([])
      setIsLoading(false)
      return
    }
    
    // If no search term, load initial cities
    if (!searchTerm || searchTerm.length === 0) {
      loadInitialCities(searchState)
      return
    }

    // If search term is too short, still show initial cities
    if (searchTerm.length < 2) {
      loadInitialCities(searchState)
      return
    }

    setIsLoading(true)
    try {
      let query = supabase
        .from('canonical_cities')
        .select('*')
        .limit(10)

      // If state is selected, filter by state
      if (searchState) {
        query = query.eq('state', searchState)
      }

      // Use full-text search or pattern matching
      const { data, error } = await query
        .or(`city_name.ilike.%${searchTerm}%,aliases.cs.{${searchTerm}}`)
        .order('population', { ascending: false })

      if (error) throw error

      // If no exact match and custom allowed, add option to create new
      const exactMatch = data?.find(
        city => city.city_name.toLowerCase() === searchTerm.toLowerCase()
      )

      let finalSuggestions = data || []
      
      if (!exactMatch && allowCustom && searchState && searchTerm.length >= 2) {
        finalSuggestions = [
          ...finalSuggestions,
          {
            id: 'custom',
            city_name: searchTerm,
            state: searchState,
            population: null,
            isCustom: true
          }
        ]
      }

      setSuggestions(finalSuggestions)
      setShowDropdown(finalSuggestions.length > 0)
    } catch (error) {
      console.error('Error searching cities:', error)
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }, [allowCustom, loadInitialCities])

  // Load cities when state changes (without input value)
  useEffect(() => {
    if (state && !inputValue) {
      // Don't auto-load, just clear suggestions until user focuses
      setSuggestions([])
      setShowDropdown(false)
    }
  }, [state, inputValue])

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchCities(inputValue, state)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [inputValue, state, searchCities])

  const handleInputChange = (e) => {
    const newValue = e.target.value
    setInputValue(newValue)
    onChange?.(newValue)
    setSelectedIndex(-1)
  }

  const handleSelectCity = (city) => {
    setInputValue(city.city_name)
    setShowDropdown(false)
    onSelect?.(city)
  }

  const handleKeyDown = (e) => {
    if (!showDropdown || suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : 0)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelectCity(suggestions[selectedIndex])
        }
        break
      case 'Escape':
        setShowDropdown(false)
        setSelectedIndex(-1)
        break
    }
  }

  const formatPopulation = (pop) => {
    if (!pop) return ''
    if (pop >= 1000000) {
      return `${(pop / 1000000).toFixed(1)}M`
    }
    if (pop >= 1000) {
      return `${(pop / 1000).toFixed(0)}K`
    }
    return pop.toString()
  }

  return (
    <div className="city-autocomplete" ref={dropdownRef}>
      <div className="autocomplete-input-wrapper">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (state) {
              updateDropdownPosition()
              if (suggestions.length > 0) {
                setShowDropdown(true)
              } else {
                // Load initial cities when focusing on empty field
                loadInitialCities(state)
              }
            }
          }}
          placeholder={placeholder}
          disabled={!state}
          className="autocomplete-input"
        />
        {isLoading && (
          <div className="autocomplete-spinner">
            <Loader size={16} className="spinning" />
          </div>
        )}
      </div>

      {showDropdown && suggestions.length > 0 && (
        <div 
          className="autocomplete-dropdown"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`
          }}
        >
          {suggestions.map((city, index) => (
            <div
              key={city.id}
              className={`autocomplete-item ${
                index === selectedIndex ? 'selected' : ''
              } ${city.isCustom ? 'custom-option' : ''}`}
              onClick={() => handleSelectCity(city)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div className="city-info">
                <MapPin size={16} />
                <span className="city-name">{city.city_name}</span>
                {city.population && (
                  <span className="city-population">
                    {formatPopulation(city.population)} pop.
                  </span>
                )}
              </div>
              {city.isCustom ? (
                <span className="custom-label">Add new city</span>
              ) : (
                city.is_verified && <Check size={16} className="verified" />
              )}
            </div>
          ))}
        </div>
      )}

      {!state ? (
        <small className="autocomplete-hint">
          Please select a state first
        </small>
      ) : !showDropdown && suggestions.length === 0 && !inputValue && (
        <small className="autocomplete-hint">
          Click to see cities in {state}
        </small>
      )}
    </div>
  )
}

export default CityAutocomplete