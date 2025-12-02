import { render, screen } from '@testing-library/react';
import { Navbar } from '../components/Navbar';

test('renderiza título e botões do Navbar', () => {
  const noop = () => {};
  render(<Navbar currentPage="rodovias" onPageChange={noop} />);
  expect(screen.getByText(/Segurança Pública Brasil/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Rodovias/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Ocorrências/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Presídios/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Fontes/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Acesso aos dados/i })).toBeInTheDocument();
});