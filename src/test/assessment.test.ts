import { describe, expect, it } from "vitest";
import { assessAnswer, FINAL_QUESTIONS } from "@/lib/assessment";

describe("Final assessment loop", () => {
  it("returns an incorrect final answer to tutoring", () => {
    expect(assessAnswer(3, "A")).toBe("retry");
  });
  it("returns mistakes on any question to tutoring", () => {
    FINAL_QUESTIONS.forEach((question, index) => {
      question.options.filter((option) => option.k !== question.correct).forEach((option) => {
        expect(assessAnswer(index, option.k)).toBe("retry");
      });
    });
  });
  it("advances correct answers and only completes after the last correct answer", () => {
    expect([assessAnswer(0, "B"), assessAnswer(1, "A"), assessAnswer(2, "C"), assessAnswer(3, "B")])
      .toEqual(["next", "next", "next", "success"]);
  });
});