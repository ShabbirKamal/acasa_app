"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { motion } from "framer-motion"

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

// Modal wrapper component
export function ModalWrapper({ children }: ModalProviderProps) {
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

// Modal transition component
interface ModalTransitionProps {
  children: ReactNode
  modalType: ModalType
}

export function ModalTransition({ children, modalType }: ModalTransitionProps) {
  const { currentModal, isTransitioning } = useModal()

  const isActive = currentModal === modalType

  // Don't render anything if this modal isn't active and not transitioning
  if (!isActive && !isTransitioning) {
    return null
  }

  return (
    <motion.div
      key={modalType}
      initial={{ opacity: 0 }}
      animate={{ opacity: isActive ? 1 : 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      style={{
        display: isActive ? "block" : "none",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 50,
        pointerEvents: isActive ? "auto" : "none",
      }}
    >
      {children}
    </motion.div>
  )
}
