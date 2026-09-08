import { createContext, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { APP_TITLE } from '@/utils/constants';

interface AppValue {
  title: string;
  setTitle: (v: string) => void;
}

export const AppContext = createContext<AppValue | null>(null);

export function AppProvider({ children }: PropsWithChildren) {
  const [title, setTitle] = useState(APP_TITLE);

  return <AppContext.Provider value={{ title, setTitle }}>{children}</AppContext.Provider>;
}
