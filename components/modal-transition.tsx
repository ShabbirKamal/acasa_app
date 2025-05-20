"use client";

import React from "react";
import { AnimatePresence, motion, Variants } from "framer-motion";
import { useModal } from "@/contexts/modal-context";

interface ModalTransitionProps {
  children: React.ReactNode;
  modalType: "initial" | "script-selection" | "controls" | "scripts" | null;
}

// Define variants for entry/exit animations
const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0 },
};

export const ModalTransition: React.FC<ModalTransitionProps> = ({ children, modalType }) => {
  const { currentModal, isTransitioning } = useModal();
  const isActive = currentModal === modalType;

  return (
    // AnimatePresence with mode="wait" ensures exit animation completes before the next enters
    <AnimatePresence initial={false} mode="wait">
      {(isActive || isTransitioning) && (
        <motion.div
          key={modalType ?? "null"}
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          className="absolute inset-0 flex items-center justify-center"
          style={{ pointerEvents: isActive ? "auto" : "none" }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
