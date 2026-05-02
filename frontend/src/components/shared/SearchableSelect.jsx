import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';

export default function SearchableSelect({ options, value, onChange, placeholder = 'Select...' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef(null);

  const selectedOption = options.find(o => o.value === value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(o => 
    o.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div 
        className="input-glass w-full px-3 py-2 text-sm rounded-xl flex items-center justify-between cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={selectedOption ? 'text-on-surface' : 'text-on-surface-variant'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className="w-4 h-4 text-on-surface-variant" />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-[#171f33] border border-white/10 rounded-xl shadow-lg overflow-hidden flex flex-col max-h-60">
          <div className="p-2 border-b border-white/5 flex items-center gap-2">
            <Search className="w-4 h-4 text-on-surface-variant" />
            <input 
              type="text" 
              className="bg-transparent border-none outline-none text-sm text-on-surface w-full"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-on-surface-variant text-center">No results found</div>
            ) : (
              filteredOptions.map(option => (
                <div 
                  key={option.value}
                  className={`px-3 py-2 text-sm cursor-pointer hover:bg-primary/20 transition-colors ${value === option.value ? 'bg-primary/10 text-primary font-medium' : 'text-on-surface'}`}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                    setSearch('');
                  }}
                >
                  {option.label}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
