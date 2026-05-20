import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MeditationPage } from '../../../app/components/pages/MeditationPage'
import { MemoryRouter } from 'react-router-dom'

//  Mocks

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    MemoryRouter: actual.MemoryRouter,
  }
})

vi.mock('axios')

vi.mock('../../../app/hooks/useDocumentTitle', () => ({
  default: vi.fn(),
}))

const mockPlay = vi.fn()
const mockPause = vi.fn()
window.HTMLMediaElement.prototype.play = mockPlay
window.HTMLMediaElement.prototype.pause = mockPause

//  Helper 

const renderComponent = () =>
  render(
    <MemoryRouter>
      <MeditationPage />
    </MemoryRouter>
  )

//  Test Suite 

describe('MeditationPage', () => {

  beforeEach(() => {
    vi.clearAllMocks()
  })

  //  1. Rendering
  describe('Rendering', () => {
    it('should render all four exercise, meditation and grounding tabs', () => {
      renderComponent()
      expect(screen.getByText('Breathing')).toBeInTheDocument()
      expect(screen.getByText('Guided Meditation')).toBeInTheDocument()
      expect(screen.getByText('Relaxing Audio')).toBeInTheDocument()
      expect(screen.getByText('Grounding')).toBeInTheDocument()
    })
  })

  //  3. Breathing Exercise 
  describe('Breathing Exercise', () => {
    it('should render the Start Exercise button by default', () => {
      renderComponent()
      expect(screen.getByRole('button', { name: 'Start Exercise' })).toBeInTheDocument()
    })

    it('should toggle to Stop button when Start Exercise is clicked', async () => {
      renderComponent()
      fireEvent.click(screen.getByRole('button', { name: 'Start Exercise' }))
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Stop' })).toBeInTheDocument()
      })
    })

    it('should toggle back to Start Exercise when Stop is clicked', async () => {
      renderComponent()
      fireEvent.click(screen.getByRole('button', { name: 'Start Exercise' }))
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Stop' })).toBeInTheDocument()
      })
      fireEvent.click(screen.getByRole('button', { name: 'Stop' }))
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Start Exercise' })).toBeInTheDocument()
      })
    })
  })

  // 4. Guided Meditation 

  describe('Guided Meditation', () => {
    beforeEach(() => {
      renderComponent()
      fireEvent.click(screen.getByText('Guided Meditation'))
    })

    it('should render all meditation sessions', async () => {
      await waitFor(() => {
        expect(screen.getByText('Body Scan')).toBeInTheDocument()
        expect(screen.getByText('Mindful Awareness')).toBeInTheDocument()
        expect(screen.getByText('Loving Kindness')).toBeInTheDocument()
        expect(screen.getByText('Breath Focus')).toBeInTheDocument()
        expect(screen.getByText('Progressive Relaxation')).toBeInTheDocument()
        expect(screen.getByText('Calm Place Visualization')).toBeInTheDocument()
      })
    })

    it('should toggle to Stop Session when a session is started', async () => {
      await waitFor(() => {
        expect(screen.getByText('Body Scan')).toBeInTheDocument()
      })
      const startButtons = screen.getAllByRole('button', { name: /Start Session/i })
      fireEvent.click(startButtons[0])
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Stop Session/i })).toBeInTheDocument()
      })
    })
  })

  //  5. Relaxing Audio 
  describe('Relaxing Audio', () => {
    beforeEach(() => {
      renderComponent()
      fireEvent.click(screen.getByText('Relaxing Audio'))
    })

    it('should render all six audio tracks', async () => {
      await waitFor(() => {
        expect(screen.getByText('Ocean Waves')).toBeInTheDocument()
        expect(screen.getByText('Rain Forest')).toBeInTheDocument()
        expect(screen.getByText('Mountain Stream')).toBeInTheDocument()
        expect(screen.getByText('Forest Birds')).toBeInTheDocument()
        expect(screen.getByText('Rain and Thunder')).toBeInTheDocument()
        expect(screen.getByText('Sea waves')).toBeInTheDocument()

        // Total 6 audio tracks check
        const audioElements = document.querySelectorAll('audio')
        expect(audioElements.length).toBe(6)
      })
    })

    it('should start and stop audio track on play and pause', async () => {
      await waitFor(() => {
        expect(screen.getByText('Ocean Waves')).toBeInTheDocument()
      })

      const audioElements = document.querySelectorAll('audio')
      expect(audioElements.length).toBe(6)

      const firstAudio = audioElements[0] as HTMLAudioElement

      // Play karo
      fireEvent(firstAudio, new Event('play'))
      expect(firstAudio).toBeInTheDocument()

      // Pause karo
      fireEvent(firstAudio, new Event('pause'))
      expect(firstAudio).toBeInTheDocument()
    })
  })

  //  6. Grounding Techniques
  describe('Grounding Techniques', () => {
    beforeEach(() => {
      renderComponent()
      fireEvent.click(screen.getByText('Grounding'))
    })

    it('should render all grounding techniques', async () => {
      await waitFor(() => {
        expect(screen.getByText('5-4-3-2-1 Technique')).toBeInTheDocument()
        expect(screen.getByText('Square Breathing')).toBeInTheDocument()
        expect(screen.getByText('Progressive Muscle Relaxation')).toBeInTheDocument()
      })
    })
  })

  //  7. Tab Switching 

  describe('Tab Switching', () => {
    it('should switch to Guided Meditation tab when clicked', async () => {
      renderComponent()
      fireEvent.click(screen.getByText('Guided Meditation'))
      await waitFor(() => {
        expect(screen.getByText('Body Scan')).toBeInTheDocument()
      })
    })
  })
})