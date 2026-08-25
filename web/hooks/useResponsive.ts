"use client";

import { useMediaQuery } from "react-responsive";

const useResponsive = () => {
  const isMobile = useMediaQuery({ query: "(max-width: 576px)" });
  const isTablet = useMediaQuery({ query: "(max-width: 768px)" });
  const isLaptop = useMediaQuery({ query: "(max-width: 992px)" });
  const isDesktop = useMediaQuery({ query: "(min-width: 1200px)" });

  return { isMobile, isTablet, isLaptop, isDesktop };
};

export default useResponsive;