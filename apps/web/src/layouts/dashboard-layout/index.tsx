import { useRef } from "react";
import { Outlet, useLocation } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";

const navPaths = ["/dashboard", "/agents", "/sessions", "/skills", "/gateway"];

function getNavIndex(pathname: string) {
  const idx = navPaths.findIndex((p) => pathname.startsWith(p));
  return idx === -1 ? 0 : idx;
}

export function DashboardLayout() {
  const location = useLocation();
  const prevIndexRef = useRef(getNavIndex(location.pathname));

  const currentIndex = getNavIndex(location.pathname);
  const direction = currentIndex >= prevIndexRef.current ? 1 : -1;
  prevIndexRef.current = currentIndex;

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={{ y: direction * 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: direction * -40, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="absolute inset-0 overflow-auto p-6"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
