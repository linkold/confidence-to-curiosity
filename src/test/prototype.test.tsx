import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PrototypeProvider, usePrototype } from "@/lib/prototype";

describe("In-memory prototype", () => {
  it("retains generated class configuration across portal views", () => {
    const { result } = renderHook(() => usePrototype(), { wrapper: PrototypeProvider });
    act(() => {
      result.current.setConfig({ topic: "Estructuras de Control", rigor: 5, friction: 2 });
      result.current.setGenerated(true);
    });
    expect(result.current.config).toEqual({ topic: "Estructuras de Control", rigor: 5, friction: 2 });
    expect(result.current.generated).toBe(true);
  });
  it("records completed student validation for the teacher monitor", () => {
    const { result } = renderHook(() => usePrototype(), { wrapper: PrototypeProvider });
    act(() => result.current.setStudent({alias:"Lincoln", validated:false}));
    expect(result.current.student?.validated).toBe(false);
    act(() => result.current.setStudent({alias:"Lincoln", validated:true}));
    expect(result.current.student).toEqual({alias:"Lincoln",validated:true});
  });
});