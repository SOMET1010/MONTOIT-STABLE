import { useState, useEffect } from 'react';

interface SkipLink {
  id: string;
  label: string;
}

interface SkipLinksProps {
  links: SkipLink[];
}

const SkipLinks: React.FC<SkipLinksProps> = ({ links }) => {
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setIsFocused(true);
      }
    };

    const handleMouseDown = () => {
      setIsFocused(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  if (!isFocused) return null;

  return (
    <div className="fixed top-0 left-0 z-50 flex flex-col p-2 bg-white border-b border-gray-200 shadow-lg">
      {links.map((link) => (
        <a
          key={link.id}
          href={`#${link.id}`}
          className="block px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-terracotta-500 focus:border-transparent"
          onClick={() => {
            const element = document.getElementById(link.id);
            if (element) {
              element.focus();
              element.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        >
          {link.label}
        </a>
      ))}
    </div>
  );
};

export default SkipLinks;