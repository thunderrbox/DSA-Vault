import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import ProblemsList from "./ProblemsList.jsx";

// Mock next/navigation hooks
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      replace: jest.fn(),
    };
  },
  usePathname() {
    return "/problems";
  },
  useSearchParams() {
    return {
      get: jest.fn().mockReturnValue(null),
    };
  },
}));

const mockProblems = [
  {
    id: "1",
    problemNumber: "1",
    title: "Two Sum",
    slug: "two-sum",
    difficulty: "Easy",
    tags: [{ id: "tag1", name: "Array" }],
    solutions: [{ language: "cpp" }],
    createdAt: new Date("2026-08-20"),
  },
  {
    id: "2",
    problemNumber: "235",
    title: "Lowest Common Ancestor",
    slug: "lowest-common-ancestor",
    difficulty: "Medium",
    tags: [{ id: "tag2", name: "Tree" }],
    solutions: [{ language: "cpp" }],
    createdAt: new Date("2026-08-21"),
  },
];

describe("ProblemsList UI Component Filter & Search", () => {
  it("should render initial problems list successfully", () => {
    render(<ProblemsList initialProblems={mockProblems} availableTags={["Array", "Tree"]} />);

    expect(screen.getByText("Two Sum")).toBeInTheDocument();
    expect(screen.getByText("Lowest Common Ancestor")).toBeInTheDocument();
    expect(screen.getByText("Showing 2 of 2 problems")).toBeInTheDocument();
  });

  it("should filter problems matching search text query", () => {
    render(<ProblemsList initialProblems={mockProblems} availableTags={["Array", "Tree"]} />);

    const searchInput = screen.getByPlaceholderText("Search problems or tags...");
    
    // Search for "Ancestor"
    fireEvent.change(searchInput, { target: { value: "Ancestor" } });

    // "Lowest Common Ancestor" should remain, but "Two Sum" should be filtered out
    expect(screen.getByText("Lowest Common Ancestor")).toBeInTheDocument();
    expect(screen.queryByText("Two Sum")).not.toBeInTheDocument();
    expect(screen.getByText("Showing 1 of 2 problems")).toBeInTheDocument();
  });

  it("should filter problems based on difficulty checkbox toggle", () => {
    render(<ProblemsList initialProblems={mockProblems} availableTags={["Array", "Tree"]} />);

    // Toggle "Easy" filter
    const easyCheckbox = screen.getByLabelText("Easy");
    fireEvent.click(easyCheckbox);

    // "Two Sum" (Easy) remains, LCA (Medium) filtered out
    expect(screen.getByText("Two Sum")).toBeInTheDocument();
    expect(screen.queryByText("Lowest Common Ancestor")).not.toBeInTheDocument();
  });
});
