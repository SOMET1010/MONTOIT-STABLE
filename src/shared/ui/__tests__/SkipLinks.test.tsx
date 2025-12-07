import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SkipLinks from '../SkipLinks';

describe('SkipLinks', () => {
  const mockLinks = [
    { id: 'main-content', label: 'Aller au contenu principal' },
    { id: 'main-navigation', label: 'Aller à la navigation' },
    { id: 'footer', label: 'Aller au pied de page' },
  ];

  beforeEach(() => {
    // Ajouter les éléments cibles au DOM
    document.body.innerHTML = `
      <main id="main-content" tabindex="-1">Contenu principal</main>
      <nav id="main-navigation">Navigation</nav>
      <footer id="footer">Pied de page</footer>
    `;
  });

  it('ne devrait pas afficher les liens par défaut', () => {
    render(<SkipLinks links={mockLinks} />);

    const skipLinksContainer = screen.queryByRole('group');
    expect(skipLinksContainer).not.toBeInTheDocument();
  });

  it('devrait afficher les liens au focus clavier', async () => {
    render(<SkipLinks links={mockLinks} />);

    // Simuler l'appui sur Tab
    fireEvent.keyDown(document, { key: 'Tab' });

    const skipLinksContainer = screen.getByRole('group');
    expect(skipLinksContainer).toBeInTheDocument();

    mockLinks.forEach((link) => {
      const skipLink = screen.getByRole('link', { name: link.label });
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveAttribute('href', `#${link.id}`);
    });
  });

  it('devrait masquer les liens au clic de souris', async () => {
    const user = userEvent.setup();
    render(<SkipLinks links={mockLinks} />);

    // Simuler l'appui sur Tab
    fireEvent.keyDown(document, { key: 'Tab' });

    const skipLinksContainer = screen.getByRole('group');
    expect(skipLinksContainer).toBeInTheDocument();

    // Simuler un clic de souris
    fireEvent.mouseDown(document);

    expect(skipLinksContainer).not.toBeInTheDocument();
  });

  it('devrait naviguer vers l élément cible et lui donner le focus', async () => {
    const user = userEvent.setup();
    render(<SkipLinks links={mockLinks} />);

    // Afficher les liens
    fireEvent.keyDown(document, { key: 'Tab' });

    const mainContentLink = screen.getByRole('link', { name: 'Aller au contenu principal' });
    await user.click(mainContentLink);

    const mainContent = document.getElementById('main-content');
    expect(mainContent).toHaveFocus();
  });

  it('devrait gérer les liens vides', () => {
    render(<SkipLinks links={[]} />);

    fireEvent.keyDown(document, { key: 'Tab' });

    const skipLinksContainer = screen.queryByRole('group');
    expect(skipLinksContainer).not.toBeInTheDocument();
  });

  it('devrait avoir les classes CSS appropriées', () => {
    render(<SkipLinks links={mockLinks} />);

    fireEvent.keyDown(document, { key: 'Tab' });

    const container = document.querySelector('.fixed.top-0.left-0.z-50');
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass(
      'fixed',
      'top-0',
      'left-0',
      'z-50',
      'flex',
      'flex-col',
      'p-2',
      'bg-white',
      'border-b',
      'border-gray-200',
      'shadow-lg'
    );

    mockLinks.forEach((link) => {
      const skipLink = screen.getByRole('link', { name: link.label });
      expect(skipLink).toHaveClass(
        'block',
        'px-4',
        'py-2',
        'text-sm',
        'font-medium',
        'text-gray-900',
        'bg-white',
        'border',
        'border-gray-300',
        'rounded',
        'hover:bg-gray-50',
        'focus:outline-none',
        'focus:ring-2',
        'focus:ring-terracotta-500',
        'focus:border-transparent'
      );
    });
  });
});