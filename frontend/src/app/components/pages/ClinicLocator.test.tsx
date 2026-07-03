import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ClinicLocator } from '../../../app/components/pages/ClinicLocator'
import { MemoryRouter } from 'react-router-dom'

// ─── Mocks ───────────────────────────────────────────────────────────────────

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('axios', () => ({
  default: {
    get: vi.fn().mockResolvedValue({
      data: {
        data: [
          {
            name: 'MindCare Clinic',
            location: '123 Main Street, Karachi',
            contact_no: '021-1234567',
            latitude: 24.8607,
            longitude: 67.0011,
          },
          {
            name: 'Mental Health Center',
            location: '456 Block B, Lahore',
            contact_no: '042-7654321',
            latitude: 31.5204,
            longitude: 74.3587,
          },
        ]
      }
    }),
    post: vi.fn().mockResolvedValue({ data: {} }),
  }
}))

vi.mock('../../../app/context/AlertContext', () => ({
  useAlert: () => ({ setAlert: vi.fn() }),
}))

vi.mock('../../../app/context/AuthContext', () => ({
  useAuth: () => ({
    user: {
      name: 'John Doe',
      email: 'john@example.com',
      latitude: 24.8607,
      longitude: 67.0011,
    },
  }),
}))

vi.mock('../../../app/components/loader/loader', () => ({
  default: () => <div data-testid="loader">Loading...</div>,
}))

vi.mock('../../../app/hooks/useDocumentTitle', () => ({
  default: vi.fn(),
}))

// Geolocation Mock
const mockGeolocation = {
  getCurrentPosition: vi.fn().mockImplementation((success) =>
    success({ coords: { latitude: 24.8607, longitude: 67.0011 } })
  ),
}
Object.defineProperty(globalThis.navigator, 'geolocation', {
  value: mockGeolocation,
  writable: true,
})

// ─── Helper ──────────────────────────────────────────────────────────────────

const renderComponent = () =>
  render(
    <MemoryRouter>
      <ClinicLocator />
    </MemoryRouter>
  )

// ─── Test Suite ──────────────────────────────────────────────────────────────

describe('ClinicLocator', () => {

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ── 1. Buttons ────────────────────────────────────────────────────────────

  describe('Location Buttons', () => {
    it('should render both current location and stored location buttons', () => {
      renderComponent()
      expect(screen.getByText('Find Clinics NearBy My Current Location')).toBeInTheDocument()
      expect(screen.getByText('Find Clinics NearBy My Stored Location')).toBeInTheDocument()
    })
  })

  // ── 2. Current Location Search ────────────────────────────────────────────

  describe('Current Location Search', () => {
    it('should show clinics when current location button is clicked', async () => {
      renderComponent()
      fireEvent.click(screen.getByText('Find Clinics NearBy My Current Location'))
      await waitFor(() => {
        expect(screen.getByText('MindCare Clinic')).toBeInTheDocument()
        expect(screen.getByText('Mental Health Center')).toBeInTheDocument()
      })
    })
  })

  // ── 3. Stored Location Search ─────────────────────────────────────────────

  describe('Stored Location Search', () => {
    it('should show clinics when stored location button is clicked', async () => {
      renderComponent()
      fireEvent.click(screen.getByText('Find Clinics NearBy My Stored Location'))
      await waitFor(() => {
        expect(screen.getByText('MindCare Clinic')).toBeInTheDocument()
        expect(screen.getByText('Mental Health Center')).toBeInTheDocument()
      })
    })
  })

  // ── 4. Clinic Details ─────────────────────────────────────────────────────

  describe('Clinic Details', () => {
    it('should show clinic address and phone number', async () => {
      renderComponent()
      fireEvent.click(screen.getByText('Find Clinics NearBy My Current Location'))
      await waitFor(() => {
        expect(screen.getByText('123 Main Street, Karachi')).toBeInTheDocument()
        expect(screen.getByText('021-1234567')).toBeInTheDocument()
      })
    })
  })

  // ── 5. Google Maps Button ─────────────────────────────────────────────────

  describe('Google Maps', () => {
    it('should show View Map button that opens google maps for each clinic', async () => {
      renderComponent()
      fireEvent.click(screen.getByText('Find Clinics NearBy My Current Location'))
      await waitFor(() => {
        const viewMapButtons = screen.getAllByText('View Map')
        expect(viewMapButtons.length).toBeGreaterThan(0)

        // Google Maps link check
        const mapLinks = document.querySelectorAll('a[href*="google.com/maps"]')
        expect(mapLinks.length).toBeGreaterThan(0)
      })
    })
  })

  // ── 6. Navigation ─────────────────────────────────────────────────────────

  describe('Navigation', () => {
    it('should navigate to /dashboard when back button is clicked', () => {
      renderComponent()
      fireEvent.click(screen.getByTitle('Dashboard'))
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    })
  })
})