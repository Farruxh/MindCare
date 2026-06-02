import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SelfAssessment } from './SelfAssessment'
import { MemoryRouter } from 'react-router-dom'

// ─── Mocks ───────────────────────────────────────────────────────────────────

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('axios', () => ({
  default: {
    post: vi.fn().mockResolvedValue({ data: { message: 'Assessment saved successfully!' } }),
  }
}))

vi.mock('../../context/AlertContext', () => ({
  useAlert: () => ({ setAlert: vi.fn() }),
}))

vi.mock('../loader/loader', () => ({
  default: () => <div data-testid="loader">Loading...</div>,
}))

vi.mock('../../hooks/useDocumentTitle', () => ({
  default: vi.fn(),
}))

// localStorage mock
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value },
    clear: () => { store = {} },
  }
})()
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// ─── Helper ──────────────────────────────────────────────────────────────────

const renderComponent = () =>
  render(
    <MemoryRouter>
      <SelfAssessment />
    </MemoryRouter>
  )

// Answer all questions helper
const answerAllQuestions = async (buttonText: string) => {
  let continueAnswering = true
  while (continueAnswering) {
    const buttons = screen.queryAllByText(buttonText)
    if (buttons.length > 0) {
      fireEvent.click(buttons[0])
      await new Promise(resolve => setTimeout(resolve, 400))
    } else {
      continueAnswering = false
    }
  }
}

// ─── Test Suite ──────────────────────────────────────────────────────────────

describe('SelfAssessment', () => {

  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.clear()
    localStorageMock.setItem('isEmailPreference', 'true')
  })

  // ── 1. Questions Show Ho Rahe Hain ────────────────────────────────────────

  describe('Questions', () => {
    it('should show questions when anxiety assessment is started', async () => {
      renderComponent()

      // Anxiety select karo
      fireEvent.click(screen.getByText('Anxiety'))
      fireEvent.click(screen.getByText(/Start Assessment/i))

      await waitFor(() => {
        // GAD-7 ka pehla question check karo
        expect(screen.getByText('Feeling nervous, anxious, or on edge?')).toBeInTheDocument()
      })
    })

    it('should show questions when depression assessment is started', async () => {
      renderComponent()

      // Depression select karo
      fireEvent.click(screen.getByText('Depression'))
      fireEvent.click(screen.getByText(/Start Assessment/i))

      await waitFor(() => {
        // PHQ-9 ka pehla question check karo
        expect(screen.getByText('Little interest or pleasure in doing things?')).toBeInTheDocument()
      })
    })

    it('should show questions when stress assessment is started', async () => {
      renderComponent()

      // Stress select karo
      fireEvent.click(screen.getByText('Stress'))
      fireEvent.click(screen.getByText(/Start Assessment/i))

      await waitFor(() => {
        // PSS-10 ka pehla question check karo
        expect(screen.getByText(/In the last month, how often have you been upset/i)).toBeInTheDocument()
      })
    })

    it('should show question number and progress while answering', async () => {
      renderComponent()

      fireEvent.click(screen.getByText('Anxiety'))
      fireEvent.click(screen.getByText(/Start Assessment/i))

      await waitFor(() => {
        expect(screen.getByText(/Question 1 of 7/i)).toBeInTheDocument()
      })
    })
  })

  // ── 2. Scores Show Ho Rahe Hain ───────────────────────────────────────────

  describe('Scores', () => {
    it('should show assessment results after all anxiety questions are answered', async () => {
      renderComponent()

      fireEvent.click(screen.getByText('Anxiety'))
      fireEvent.click(screen.getByText(/Start Assessment/i))

      await waitFor(() => {
        expect(screen.getByText('Feeling nervous, anxious, or on edge?')).toBeInTheDocument()
      })

      // Sare 7 GAD-7 questions ka jawab do
      await answerAllQuestions('Not at all')

      await waitFor(() => {
        expect(screen.getByText('Assessment Complete')).toBeInTheDocument()
        expect(screen.getByText('Anxiety')).toBeInTheDocument()
        expect(screen.getByText('GAD-7 Results')).toBeInTheDocument()
      }, { timeout: 5000 })
    })

    it('should show severity level in results', async () => {
      renderComponent()

      fireEvent.click(screen.getByText('Anxiety'))
      fireEvent.click(screen.getByText(/Start Assessment/i))

      await waitFor(() => {
        expect(screen.getByText('Feeling nervous, anxious, or on edge?')).toBeInTheDocument()
      })

      await answerAllQuestions('Not at all')

      await waitFor(() => {
        // Severity dikhni chahiye — Minimal, Mild, Moderate, Severe
        const severityTexts = ['Minimal', 'Mild', 'Moderate', 'Severe']
        const found = severityTexts.some(s => screen.queryByText(s))
        expect(found).toBe(true)
      }, { timeout: 5000 })
    })
  })

  // ── 3. Talk to AI & Find Clinic ───────────────────────────────────────────

  describe('Talk to AI and Find Help', () => {
    it('should show Talk to AI button after assessment is complete', async () => {
      renderComponent()

      fireEvent.click(screen.getByText('Anxiety'))
      fireEvent.click(screen.getByText(/Start Assessment/i))

      await waitFor(() => {
        expect(screen.getByText('Feeling nervous, anxious, or on edge?')).toBeInTheDocument()
      })

      await answerAllQuestions('Not at all')

      await waitFor(() => {
        expect(screen.getByText('Talk to AI')).toBeInTheDocument()
      }, { timeout: 5000 })
    })

    it('should show Find Help button after assessment is complete', async () => {
      renderComponent()

      fireEvent.click(screen.getByText('Anxiety'))
      fireEvent.click(screen.getByText(/Start Assessment/i))

      await waitFor(() => {
        expect(screen.getByText('Feeling nervous, anxious, or on edge?')).toBeInTheDocument()
      })

      await answerAllQuestions('Not at all')

      await waitFor(() => {
        expect(screen.getByText('Find Help')).toBeInTheDocument()
      }, { timeout: 5000 })
    })

    it('should navigate to /assistant when Talk to AI is clicked', async () => {
      renderComponent()

      fireEvent.click(screen.getByText('Anxiety'))
      fireEvent.click(screen.getByText(/Start Assessment/i))

      await waitFor(() => {
        expect(screen.getByText('Feeling nervous, anxious, or on edge?')).toBeInTheDocument()
      })

      await answerAllQuestions('Not at all')

      await waitFor(() => {
        expect(screen.getByText('Talk to AI')).toBeInTheDocument()
      }, { timeout: 5000 })

      fireEvent.click(screen.getByText('Talk to AI'))
      expect(mockNavigate).toHaveBeenCalledWith('/assistant')
    })
  })

  // ── 4. PSS, GAD, PHQ Scale Questions Check ────────────────────────────────

  describe('Scale Questions Verification', () => {
    it('should show correct GAD-7 questions for anxiety assessment', async () => {
      renderComponent()

      fireEvent.click(screen.getByText('Anxiety'))
      fireEvent.click(screen.getByText(/Start Assessment/i))

      await waitFor(() => {
        // GAD-7 ka total 7 questions hone chahiye
        expect(screen.getByText(/Question 1 of 7/i)).toBeInTheDocument()
        expect(screen.getByText('Feeling nervous, anxious, or on edge?')).toBeInTheDocument()
      })
    })

    it('should show correct PHQ-9 questions for depression assessment', async () => {
      renderComponent()

      fireEvent.click(screen.getByText('Depression'))
      fireEvent.click(screen.getByText(/Start Assessment/i))

      await waitFor(() => {
        // PHQ-9 ka total 9 questions hone chahiye
        expect(screen.getByText(/Question 1 of 9/i)).toBeInTheDocument()
        expect(screen.getByText('Little interest or pleasure in doing things?')).toBeInTheDocument()
      })
    })

    it('should show correct PSS-10 questions for stress assessment', async () => {
      renderComponent()

      fireEvent.click(screen.getByText('Stress'))
      fireEvent.click(screen.getByText(/Start Assessment/i))

      await waitFor(() => {
        // PSS-10 ka total 10 questions hone chahiye
        expect(screen.getByText(/Question 1 of 10/i)).toBeInTheDocument()
        expect(screen.getByText(/In the last month, how often have you been upset/i)).toBeInTheDocument()
      })
    })
  })
})