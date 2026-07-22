import React from 'react';
import { SearchFilters } from '../types';
import { AVAILABLE_INTERESTS } from '../mockData';
import { X, Sliders, Check } from 'lucide-react';

interface SearchFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
}

export default function SearchFiltersModal({ isOpen, onClose, filters, onChange }: SearchFiltersModalProps) {
  if (!isOpen) return null;

  const handleGenderChange = (gender: 'male' | 'female' | 'everyone') => {
    onChange({ ...filters, gender });
  };

  const handleAgeChange = (index: 0 | 1, val: number) => {
    const nextAge = [...filters.ageRange] as [number, number];
    nextAge[index] = val;
    // Keep min age <= max age
    if (index === 0 && nextAge[0] > nextAge[1]) {
      nextAge[1] = nextAge[0];
    } else if (index === 1 && nextAge[1] < nextAge[0]) {
      nextAge[0] = nextAge[1];
    }
    onChange({ ...filters, ageRange: nextAge });
  };

  const handleDistanceChange = (maxDistance: number) => {
    onChange({ ...filters, maxDistance });
  };

  const toggleVerified = () => {
    onChange({ ...filters, verifiedOnly: !filters.verifiedOnly });
  };

  const toggleInterest = (interest: string) => {
    const list = filters.interests.includes(interest)
      ? filters.interests.filter(i => i !== interest)
      : [...filters.interests, interest];
    onChange({ ...filters, interests: list });
  };

  const resetFilters = () => {
    onChange({
      gender: 'everyone',
      ageRange: [18, 40],
      maxDistance: 25,
      verifiedOnly: false,
      interests: []
    });
  };

  return (
    <div id="filters-backdrop" className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        id="filters-modal-card" 
        className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[85vh] flex flex-col overflow-hidden border border-rose-50 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="p-5 border-b border-rose-100 flex items-center justify-between bg-rose-50/50">
          <div className="flex items-center gap-2 text-rose-500">
            <Sliders className="w-5 h-5 text-rose-500" />
            <h3 className="text-lg font-bold text-gray-900">Advanced Match Filters</h3>
          </div>
          <button 
            id="close-filters-btn"
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:bg-rose-100 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* Gender Preference */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Show Me</label>
            <div className="grid grid-cols-3 gap-2">
              {(['female', 'male', 'everyone'] as const).map((g) => (
                <button
                  key={g}
                  id={`filter-gender-${g}`}
                  type="button"
                  onClick={() => handleGenderChange(g)}
                  className={`py-2.5 px-4 rounded-xl text-sm font-medium border capitalize transition-all ${
                    filters.gender === g
                      ? 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/20'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-rose-200 hover:bg-rose-50/20'
                  }`}
                >
                  {g === 'everyone' ? 'Everyone' : g === 'female' ? 'Women' : 'Men'}
                </button>
              ))}
            </div>
          </div>

          {/* Age Range Slider Controls */}
          <div>
            <div className="flex justify-between text-sm font-semibold text-gray-700 mb-2">
              <span>Age Range</span>
              <span className="text-rose-500 font-bold">{filters.ageRange[0]} - {filters.ageRange[1]} years</span>
            </div>
            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <span className="text-xs text-gray-400 block mb-1">Min Age</span>
                <input
                  id="age-min-slider"
                  type="range"
                  min="18"
                  max="60"
                  value={filters.ageRange[0]}
                  onChange={(e) => handleAgeChange(0, parseInt(e.target.value))}
                  className="w-full accent-rose-500 h-1.5 bg-gray-200 rounded-lg cursor-pointer"
                />
              </div>
              <div className="flex-1">
                <span className="text-xs text-gray-400 block mb-1">Max Age</span>
                <input
                  id="age-max-slider"
                  type="range"
                  min="18"
                  max="60"
                  value={filters.ageRange[1]}
                  onChange={(e) => handleAgeChange(1, parseInt(e.target.value))}
                  className="w-full accent-rose-500 h-1.5 bg-gray-200 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Maximum Distance Slider */}
          <div>
            <div className="flex justify-between text-sm font-semibold text-gray-700 mb-2">
              <span>Maximum Distance</span>
              <span className="text-rose-500 font-bold">Within {filters.maxDistance} miles</span>
            </div>
            <input
              id="distance-slider"
              type="range"
              min="1"
              max="100"
              value={filters.maxDistance}
              onChange={(e) => handleDistanceChange(parseInt(e.target.value))}
              className="w-full accent-rose-500 h-1.5 bg-gray-200 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
              <span>Nearby (1 mi)</span>
              <span>Long-distance (100 mi)</span>
            </div>
          </div>

          {/* Verification Status Toggle */}
          <div className="flex items-center justify-between p-3.5 bg-rose-50/30 rounded-2xl border border-rose-100">
            <div className="pr-4">
              <h4 className="text-sm font-semibold text-gray-900">ID Verified Profiles Only</h4>
              <p className="text-xs text-gray-500 mt-0.5">Show only users with a verified facial scan checkmark</p>
            </div>
            <button
              id="toggle-verified-only-btn"
              type="button"
              onClick={toggleVerified}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                filters.verifiedOnly ? 'bg-rose-500' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  filters.verifiedOnly ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Interests multi-select */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Must Have Hobbies / Interests</label>
            <p className="text-xs text-gray-400 mb-3">Select tags to find profiles who share specific passions</p>
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1 border border-gray-100 rounded-xl bg-gray-50/50">
              {AVAILABLE_INTERESTS.map((interest) => {
                const isSelected = filters.interests.includes(interest);
                return (
                  <button
                    key={interest}
                    id={`filter-tag-${interest.replace(/\s+/g, '-')}`}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`py-1.5 px-3 rounded-full text-xs font-medium border flex items-center gap-1 transition-all ${
                      isSelected
                        ? 'bg-rose-500 text-white border-rose-500'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-rose-300'
                    }`}
                  >
                    {interest}
                    {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-rose-100 bg-rose-50/30 flex gap-3">
          <button
            id="reset-filters-btn"
            type="button"
            onClick={resetFilters}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Reset Filters
          </button>
          <button
            id="apply-filters-btn"
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium shadow-lg shadow-rose-500/10 transition-colors"
          >
            Apply & View
          </button>
        </div>
      </div>
    </div>
  );
}
