"use client";

import { useEffect } from "react";

type BodyState = {
  pageClass?: string;
  isCartOpen?: boolean;
  isMenuOpen?: boolean;
  isModalOpen?: boolean;
};

export function useBodyState({ pageClass, isCartOpen = false, isMenuOpen = false, isModalOpen = false }: BodyState) {
  useEffect(() => {
    if (pageClass) document.body.classList.add(pageClass);
    document.body.classList.toggle("is-cart-open", isCartOpen);
    document.body.classList.toggle("is-menu-open", isMenuOpen);
    document.body.classList.toggle("is-modal-open", isModalOpen);

    return () => {
      if (pageClass) document.body.classList.remove(pageClass);
      document.body.classList.remove("is-cart-open", "is-menu-open", "is-modal-open");
    };
  }, [isCartOpen, isMenuOpen, isModalOpen, pageClass]);
}
