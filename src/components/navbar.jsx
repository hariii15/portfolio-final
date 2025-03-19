"use client";

import React from 'react'; // Add the React import
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import {
  Children,
  cloneElement,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

function DockItem({
  children,
  className = "",
  onClick,
  mouseX,
  spring,
  distance,
  magnification,
  baseItemSize,
}) {
  const ref = useRef(null);
  const isHovered = useMotionValue(0);

  const mouseDistance = useTransform(mouseX, (val) => {
    const rect = ref.current?.getBoundingClientRect() ?? {
      x: 0,
      width: baseItemSize,
    };
    return val - rect.x - baseItemSize / 2;
  });

  const targetSize = useTransform(
    mouseDistance,
    [-distance, 0, distance],
    [baseItemSize, magnification, baseItemSize]
  );
  const size = useSpring(targetSize, spring);

  return (
    <motion.div
      ref={ref}
      style={{
        width: size,
        height: size,
      }}
      onHoverStart={() => isHovered.set(1)}
      onHoverEnd={() => isHovered.set(0)}
      onFocus={() => isHovered.set(1)}
      onBlur={() => isHovered.set(0)}
      onClick={onClick}
      className={`relative inline-flex items-center justify-center rounded-full border-neutral-700 border-2 shadow-md bg-transparent backdrop-blur-md ${className}`} // Removed bg-[#060606]
      tabIndex={0}
      role="button"
      aria-haspopup="true"
    >
      {Children.map(children, (child) =>
        cloneElement(child, { isHovered })
      )}
    </motion.div>
  );
}

function DockLabel({ children, className = "", ...rest }) {
  const { isHovered } = rest;
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = isHovered.on("change", (latest) => {
      setIsVisible(latest === 1);
    });
    return () => unsubscribe();
  }, [isHovered]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: -10 }}
          exit={{ opacity: 0, y: 0 }}
          transition={{ duration: 0.2 }}
          className={`${className} absolute -top-6 left-1/2 w-fit whitespace-pre rounded-md border border-neutral-700 bg-black/30 backdrop-blur-sm px-2 py-0.5 text-xs text-white`} // Changed bg-[#060606] to bg-black/30 with backdrop blur
          role="tooltip"
          style={{ x: "-50%" }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DockIcon({ children, className = "" }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      {children}
    </div>
  );
}

export default function Dock({
  items,
  className = "",
  spring = { mass: 0.1, stiffness: 150, damping: 12 },
  magnification = 70,
  distance = 200,
  panelHeight = 64,
  dockHeight = 256,
  baseItemSize = 50,
}) {
  const mouseX = useMotionValue(Infinity);
  const isHovered = useMotionValue(0);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );

  // Responsive adjustments based on screen size
  const responsiveItemSize = useMemo(() => {
    if (windowWidth < 640) return Math.max(32, baseItemSize * 0.7); // Small screens
    if (windowWidth < 768) return Math.max(40, baseItemSize * 0.8); // Medium screens
    return baseItemSize; // Default size for larger screens
  }, [windowWidth, baseItemSize]);

  const responsiveMagnification = useMemo(() => {
    if (windowWidth < 640) return Math.max(50, magnification * 0.7);
    if (windowWidth < 768) return Math.max(60, magnification * 0.85);
    return magnification;
  }, [windowWidth, magnification]);

  // Update window width on resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const maxHeight = useMemo(
    () => Math.max(dockHeight, responsiveMagnification + responsiveMagnification / 2 + 4),
    [responsiveMagnification, dockHeight]
  );

  const heightRow = useTransform(isHovered, [0, 1], [panelHeight, panelHeight]);
  const height = useSpring(heightRow, spring);

  // Responsive gap size
  const gapSize = windowWidth < 640 ? 2 : windowWidth < 768 ? 3 : 4;

  return (
    <motion.div
      style={{ height: panelHeight, scrollbarWidth: "none" }}
      className="mx-2 flex max-w-full items-center"
    >
      <motion.div
        onMouseMove={({ pageX }) => {
          isHovered.set(1);
          mouseX.set(pageX);
        }}
        onMouseLeave={() => {
          isHovered.set(0);
          mouseX.set(Infinity);
        }}
        className={`${className} absolute bottom-2 left-1/2 transform -translate-x-1/2 flex items-end rounded-2xl border-neutral-700 border-2 pb-2 px-3 sm:px-4 bg-transparent backdrop-blur-md`} // Changed bg-[rgba(6,6,6,0.8)] to bg-transparent and increased blur
        style={{
          height: panelHeight,
          backdropFilter: "blur(8px)",
          gap: `${gapSize * 0.25}rem`
        }}
        role="toolbar"
        aria-label="Application dock"
      >
        {items.map((item, index) => (
          <DockItem
            key={index}
            onClick={item.onClick}
            className={item.className}
            mouseX={mouseX}
            spring={spring}
            distance={distance}
            magnification={responsiveMagnification}
            baseItemSize={responsiveItemSize}
          >
            <DockIcon>
              {cloneElement(item.icon, { // Use cloneElement instead of React.cloneElement
                size: windowWidth < 640 ? 14 : windowWidth < 768 ? 16 : 18
              })}
            </DockIcon>
            <DockLabel>{item.label}</DockLabel>
          </DockItem>
        ))}
      </motion.div>
    </motion.div>
  );
}
