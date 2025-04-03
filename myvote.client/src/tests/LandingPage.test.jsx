import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LandingPage from "../pages/LandingPage";

test("displays welcome page", () => {
    render(
        <MemoryRouter>
            <LandingPage />
        </MemoryRouter>
    );

    expect(screen.getByText("Welcome!")).toBeInTheDocument();
});
