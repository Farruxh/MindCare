import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Dashboard } from '../../../app/components/pages/Dashboard'
import { MemoryRouter } from 'react-router-dom'

//  Mocks 

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('axios', () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: { data: [] } }),
    post: vi.fn().mockResolvedValue({ data: { data: [] } }),
  }
}))

vi.mock('../../../app/context/AuthContext', () => ({
  useAuth: () => ({
    user: {
      name: 'John Doe',
      email: 'john@example.com',
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

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  LineChart: ({ children }: any) => <div>{children}</div>,
  Line: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
}))

//  Helper
const renderComponent = () =>
  render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>
  )

//  Test Suite 

describe('Dashboard', () => {

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // 1. Rendering 

  describe('Rendering', () => {
    

    it('should render the welcome message with user name', () => {
      renderComponent()
      expect(screen.getByText(/Welcome back, John Doe/i)).toBeInTheDocument()
    })
  })

  // 2. Navigation 

  describe('Navigation', () => {
    it('should navigate to /profile when profile button is clicked', () => {
      renderComponent()
      fireEvent.click(screen.getByTitle('My Profile'))
      expect(mockNavigate).toHaveBeenCalledWith('/profile')
    })

    it('should navigate to /meditation when Try Now is clicked', () => {
      renderComponent()
      fireEvent.click(screen.getByText('Try Now'))
      expect(mockNavigate).toHaveBeenCalledWith('/meditation')
    })
  })

  //  3. Quick Actions 

  describe('Quick Actions', () => {
    it('should render all five quick action buttons', () => {
      renderComponent()
      expect(screen.getByText('Start Chat')).toBeInTheDocument()
      expect(screen.getByText('Assessment')).toBeInTheDocument()
      expect(screen.getByText('Daily Journal')).toBeInTheDocument()
      expect(screen.getByText('Meditation')).toBeInTheDocument()
      expect(screen.getByText('Find Clinics')).toBeInTheDocument()
    })

    it('should navigate to /assistant when Start Chat is clicked', () => {
      renderComponent()
      fireEvent.click(screen.getByText('Start Chat'))
      expect(mockNavigate).toHaveBeenCalledWith('/assistant')
    })
  })

  //  4. Assessment History
  describe('Assessment History', () => {
    it('should render Assessment Progress section', () => {
      renderComponent()
      expect(screen.getByText('Assessment Progress')).toBeInTheDocument()
    })

    
  })

  //  5. Recent Sessions 

  describe('Recent Sessions', () => {
    it('should render Recent Sessions section', () => {
      renderComponent()
      expect(screen.getByText('Recent Sessions')).toBeInTheDocument()
    })

    
  })

  //  6. Logout

  describe('Logout', () => {
    it('should open confirmation dialog when logout button is clicked', async () => {
      renderComponent()
      fireEvent.click(screen.getByTitle('Log out'))
      await waitFor(() => {
        expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument()
        expect(screen.getByText('Confirm Logout')).toBeInTheDocument()
      })
    })

    it('should close confirmation dialog when Cancel is clicked', async () => {
      renderComponent()
      fireEvent.click(screen.getByTitle('Log out'))
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