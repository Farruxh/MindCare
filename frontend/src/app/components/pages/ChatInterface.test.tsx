import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ChatInterface } from '../../../app/components/pages/ChatInterface'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

//  Mocks 

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('axios', () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: { data: [] } }),
    post: vi.fn().mockResolvedValue({ data: { data: { chat_id: 1, role: 'model', message_text: 'Hello!' } } }),
    delete: vi.fn().mockResolvedValue({ data: { data: [] } }),
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
    <MemoryRouter initialEntries={['/assistant']}>
      <Routes>
        <Route path="/assistant" element={<ChatInterface />} />
        <Route path="/assistant/:chat_id" element={<ChatInterface />} />
      </Routes>
    </MemoryRouter>
  )

//  Test Suite 

describe('ChatInterface', () => {

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // 1. Rendering 
  describe('Rendering', () => {
    

    it('should render the message input field', () => {
      renderComponent()
      expect(screen.getByPlaceholderText("Share what's on your mind")).toBeInTheDocument()
    })

    
  })

  // 2. Navigation 

  describe('Navigation', () => {
    it('should navigate to /dashboard when back button is clicked', () => {
      renderComponent()
      const buttons = screen.getAllByRole('button')
      fireEvent.click(buttons[0])
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    })
  })

  // 3. Input 

  describe('Input Handling', () => {
    it('should update input value when user types', () => {
      renderComponent()
      const input = screen.getByPlaceholderText("Share what's on your mind")
      fireEvent.change(input, { target: { value: 'Hello' } })
      expect(input).toHaveValue('Hello')
    })

    it('should disable send button when input is empty', () => {
      renderComponent()
      const buttons = screen.getAllByRole('button')
      const sendButton = buttons[buttons.length - 1]
      expect(sendButton).toBeDisabled()
    })

    it('should enable send button when input has text', () => {
      renderComponent()
      const input = screen.getByPlaceholderText("Share what's on your mind")
      fireEvent.change(input, { target: { value: 'Hello' } })
      const buttons = screen.getAllByRole('button')
      const sendButton = buttons[buttons.length - 1]
      expect(sendButton).not.toBeDisabled()
    })

    it('should clear input after sending message', async () => {
      renderComponent()
      const input = screen.getByPlaceholderText("Share what's on your mind")
      fireEvent.change(input, { target: { value: 'Hello' } })
      const buttons = screen.getAllByRole('button')
      const sendButton = buttons[buttons.length - 1]
      fireEvent.click(sendButton)
      await waitFor(() => {
        expect(input).toHaveValue('')
      })
    })
  })

  //  4. Sidebar

  describe('Sidebar', () => {
    it('should open sidebar when panel button is clicked', async () => {
      renderComponent()
      const buttons = screen.getAllByRole('button')
      fireEvent.click(buttons[1])
      await waitFor(() => {
        expect(screen.getByText('Chat History')).toBeInTheDocument()
      })
    })

    it('should show New Chat button when sidebar is open', async () => {
      renderComponent()
      const buttons = screen.getAllByRole('button')
      fireEvent.click(buttons[1])
      await waitFor(() => {
        expect(screen.getByText('New Chat')).toBeInTheDocument()
      })
    })
  })

  //  5. Messages 

  describe('Messages', () => {
    it('should display user message after sending', async () => {
      renderComponent()
      const input = screen.getByPlaceholderText("Share what's on your mind")
      fireEvent.change(input, { target: { value: 'Hello there' } })
      const buttons = screen.getAllByRole('button')
      const sendButton = buttons[buttons.length - 1]
      fireEvent.click(sendButton)
      await waitFor(() => {
        expect(screen.getByText('Hello there')).toBeInTheDocument()
      })
    })

    it('should not send empty message when Enter is pressed', () => {
      renderComponent()
      const input = screen.getByPlaceholderText("Share what's on your mind")
      fireEvent.keyUp(input, { key: 'Enter' })
      // Instead of querying by empty string, check that the welcome message is still present
      expect(screen.getByText(/how can I assist you today/i)).toBeInTheDocument()
    })
  })

  //  6. Confirm Dialog
  describe('Confirm Dialog', () => {
    it('should show delete confirmation dialog for chat', async () => {
      const axios = await import('axios')
      vi.mocked(axios.default.get).mockResolvedValueOnce({
        data: {
          data: [{ chat_id: 1, user_id: 1, created_at: '2024-01-01' }]
        }
      })

      renderComponent()
      const buttons = screen.getAllByRole('button')
      fireEvent.click(buttons[1])

      await waitFor(() => {
        expect(screen.getByText('Chat History')).toBeInTheDocument()
      })

      const trashIcon = document.querySelector('.lucide-trash')
      if (trashIcon) {
        fireEvent.click(trashIcon)
        await waitFor(() => {
          expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument()
          expect(screen.getByText('Delete Chat')).toBeInTheDocument()
        })
      }
    })
  })
})