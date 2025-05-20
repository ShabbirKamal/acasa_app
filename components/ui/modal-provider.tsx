"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"

// Define modal types
export type ModalType = "initial" | "script-selection" | "controls" | "scripts" | null

// Modal context interface
interface ModalContextType {
  currentModal: ModalType
  previousModal: ModalType
  isTransitioning: boolean
  showModal: (modalType: ModalType) => void
  hideModal: () => void
  goBack: () => void
}

// Create the context
const ModalContext = createContext<ModalContextType | undefined>(undefined)

// Hook to use the modal context
export const useModal = () => {
  const context = useContext(ModalContext)
  if (context === undefined) {
    throw new Error("useModal must be used within a ModalProvider")
  }
  return context
}

// Modal provider props
interface ModalProviderProps {
  children: ReactNode
}

// Modal provider component
export function ModalProvider({ children }: ModalProviderProps) {
  const [currentModal, setCurrentModal] = useState<ModalType>(null)
  const [previousModal, setPreviousModal] = useState<ModalType>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [modalHistory, setModalHistory] = useState<ModalType[]>([])

  const showModal = useCallback(
    (modalType: ModalType) => {
      setIsTransitioning(true)
      setPreviousModal(currentModal)

      // Add current modal to history if it exists
      if (currentModal) {
        setModalHistory((prev) => [...prev, currentModal])
      }

      // Short delay to allow animation
      setTimeout(() => {
        setCurrentModal(modalType)
        setIsTransitioning(false)
      }, 300)
    },
    [currentModal],
  )

  const hideModal = useCallback(() => {
    setIsTransitioning(true)
    setPreviousModal(currentModal)

    // Short delay to allow animation
    setTimeout(() => {
      setCurrentModal(null)
      setIsTransitioning(false)
      setModalHistory([])
    }, 300)
  }, [currentModal])

  const goBack = useCallback(() => {
    if (modalHistory.length === 0) {
      hideModal()
      return
    }

    setIsTransitioning(true)
    setPreviousModal(currentModal)

    // Short delay to allow animation
    setTimeout(() => {
      // Get the last modal from history
      const newHistory = [...modalHistory]
      const lastModal = newHistory.pop()

      setCurrentModal(lastModal || null)
      setModalHistory(newHistory)
      setIsTransitioning(false)
    }, 300)
  }, [currentModal, hideModal, modalHistory])

  return (
    <ModalContext.Provider
      value={{
        currentModal,
        previousModal,
        isTransitioning,
        showModal,
        hideModal,
        goBack,
      }}
    >
      {children}
    </ModalContext.Provider>
  )
}
