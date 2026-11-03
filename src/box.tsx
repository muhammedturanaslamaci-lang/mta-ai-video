import React, {createContext, useContext} from 'react';
import {useVideoConfig} from 'remotion';

// Efektler tuvale ya da tuvalin içindeki bir pencereye (ekran paneli) göre çizilebilir.
// Pencere içindeyse genişlik, yükseklik ve yazı birimi (u) pencereye göre hesaplanır.
export type Box = {width: number; height: number; u: number};
export const BoxCtx = createContext<Box | null>(null);
export const BoxProvider: React.FC<{box: Box; children: React.ReactNode}> = ({box, children}) => (
  <BoxCtx.Provider value={box}>{children}</BoxCtx.Provider>
);

export const useVC = () => {
  const vc = useVideoConfig();
  const b = useContext(BoxCtx);
  if (b) return {...vc, width: b.width, height: b.height, u: b.u};
  return {...vc, u: vc.width / 1920};
};
