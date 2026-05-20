import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ProfilePage } from '../../../app/components/pages/ProfilePage'
import { MemoryRouter } from 'react-router-dom'

//  Mocks 

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('axios')

vi.mock('../../../app/context/AuthContext', () => ({
  useAuth: () => ({
    user: {
      name: 'John Doe',
      email: 'john@example.com',
      created_at: '2024-01-01',
      isDarkMode: 'light',
      email_notifications: true,
    },
    setUser: vi.fn(),
  }),
}))

vi.mock('../../../app/context/AlertContext', () => ({
  useAlert: () => ({ setAlert: vi.fn() }),
}))

vi.mock('../../../app/components/loader/loader', () => ({
  default: () => <div data-testid="loader">Loading...</div>,
}))

vi.mock('../../../app/components/Global/GlobalConfirmBox', () => ({
  GlobalConfirmBox: ({ open, title, onConfirm, onCancel }: any) =>
    open ? (
      <div data-testid="confirm-dialog">
        <p>{title}</p>
        <button onClick={onConfirm}>Confirm</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    ) : null,
}))

vi.mock('../../../app/hooks/useDocumentTitle', () => ({
  default: vi.fn(),
}))

//  Helper 

const renderComponent = () =>
  render(
    <MemoryRouter>
      <ProfilePage />
    </MemoryRouter>
  )

//  Test Suite
describe('ProfilePage', () => {

  beforeEach(() => {
    vi.clearAllMocks()
  })

  //  1. Rendering 

  describe('Rendering', () => {
    

    it('should display the authenticated user name', () => {
      renderComponent()
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    it('should display the authenticated user email', () => {
      renderComponent()
      expect(screen.getByText('john@example.com')).toBeInTheDocument()
    })
  })

  //  2. Navigation
  describe('Navigation', () => {
    it('should navigate to /dashboard when back button is clicked', () => {
      renderComponent()
      const backButton = screen.getByTitle('Dashboard')
      fireEvent.click(backButton)
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    })
  })

  //  3. Edit Account

  describe('Edit Account', () => {
    it('should reveal Account Information form when Edit Account is clicked', async () => {
      renderComponent()
      fireEvent.click(screen.getByText('Edit Account'))
      await waitFor(() => {
        expect(screen.getByText('Account Information')).toBeInTheDocument()
      })
    })

    it('should display Full Name and Email input fields', async () => {
      renderComponent()
      fireEvent.click(screen.getByText('Edit Account'))
      await waitFor(() => {
        expect(screen.getByText('Full Name')).toBeInTheDocument()
        expect(screen.getByText('Email')).toBeInTheDocument()
      })
    })

    it('should display the Security section with password fields', async () => {
      renderComponent()
      fireEvent.click(screen.getByText('Edit Account'))
      await waitFor(() => {
        expect(screen.getByText('Security')).toBeInTheDocument()
        expect(screen.getByText('Current Password')).toBeInTheDocument()
        expect(screen.getByText('New Password')).toBeInTheDocument()
        expect(screen.getByText('Confirm New Password')).toBeInTheDocument()
      })
    })
  })

  //  4. Preferences 

  describe('Preferences', () => {
    it('should render the Email Notifications toggle', () => {
      renderComponent()
      expect(screen.getByText('Email Notifications')).toBeInTheDocument()
    })

    it('should render the Dark Mode toggle', () => {
      renderComponent()
      expect(screen.getByText('Dark Mode')).toBeInTheDocument()
    })
  })

  //  5. Account Actions 

  describe('Account Actions', () => {
    it('should open a confirmation dialog when Log Out is clicked', async () => {
      renderComponent()
      fireEvent.click(screen.getByText('Log Out'))
      await waitFor(() => {
        expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument()
        expect(screen.getByText('Confirm Logout')).toBeInTheDocument()
      })
    })

    it('should open a confirmation dialog when Delete All Assessments is clicked', async () => {
      renderComponent()
      fireEvent.click(screen.getByRole('button', { name: 'Delete All Assessments' }))
      await waitFor(() => {
        expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument()
      })
    })

    it('should close the confirmation dialog when Cancel is clicked', async () => {
      renderComponent()
      fireEvent.click(screen.getByText('Log Out'))
      await waitFor(() => {
        expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument()
      })
      fireEvent.click(screen.getByText('Cancel'))
      await waitFor(() => {
        expect(screen.queryByTestId('confirm-dialog')).not.toBeInTheDocument()
      })
    })
  })
})