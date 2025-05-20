"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback } from "react"

type ModalType = "initial" | "script-selection" | "controls" | "scripts" | null

interface ModalContextType {
  currentModal: ModalType
  previousModal: ModalType
  isTransitioning: boolean
  showModal: (modalType: ModalType) => void
  hideModal: () => void
  goBack: () => void
}

const ModalContext = createContext<ModalContextType | undefined>(undefined)

export const useModal = () => {
  const context = useContext(ModalContext)
  if (context === undefined) {
    throw new Error("useModal must be used within a ModalProvider")
  }
  return context
}

interface ModalProviderProps {
  children: React.ReactNode
}

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
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
