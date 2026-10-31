import { createContext, useContext, useState, type ReactNode } from "react";

type ClassConfig = { topic: string; rigor: number; friction: number };
type CreatedCourse = { id: string; name: string; sessionCode: string; studentCount: number };
type Prototype = {
  status: string;
  setStatus: (status: string) => void;
  config: ClassConfig;
  setConfig: (config: ClassConfig) => void;
  generated: boolean;
  setGenerated: (generated: boolean) => void;
  student: { alias: string; validated: boolean } | null;
  setStudent: (student: { alias: string; validated: boolean } | null) => void;
  createdCourse: CreatedCourse | null;
  setCreatedCourse: (course: CreatedCourse | null) => void;
};
const PrototypeContext = createContext<Prototype | null>(null);
export function PrototypeProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState("Backend: En espera.");
  const [config, setConfig] = useState({ topic: "Estructuras de Control", rigor: 3, friction: 3 });
  const [generated, setGenerated] = useState(false);
  const [student, setStudent] = useState<Prototype["student"]>(null);
  const [createdCourse, setCreatedCourse] = useState<CreatedCourse | null>(null);
  return (
    <PrototypeContext.Provider
      value={{
        status,
        setStatus,
        config,
        setConfig,
        generated,
        setGenerated,
        student,
        setStudent,
        createdCourse,
        setCreatedCourse,
      }}
    >
      {children}
    </PrototypeContext.Provider>
  );
}
export function usePrototype() {
  const value = useContext(PrototypeContext);
  if (!value) throw new Error("PrototypeProvider is required");
  return value;
}
