import { test, vi, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, useNavigate } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import LandingPage from "../pages/LandingPage";
import { UserProvider } from "../contexts/UserContext";
import Header from "../components/Header";

// Mock `useNavigate`
vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return {
        ...actual,
        useNavigate: vi.fn(), // Mock useNavigate properly
    };
});

test("navigates to create poll page", async () => {
    const mockNavigate = vi.fn(); // Create a mock function
    useNavigate.mockReturnValue(mockNavigate); // Mock useNavigate to return our function

    render(
        <MemoryRouter>
            <LandingPage />
        </MemoryRouter>
    );

    const button = screen.getByText("Create Poll"); // Adjust based on your actual button text
    await userEvent.click(button);

    expect(mockNavigate).toHaveBeenCalledWith("/createpoll"); // Adjust expected navigation path
});

test("navigates to poll id 1", async () => {
    const mockNavigate = vi.fn(); // Create a mock function
    useNavigate.mockReturnValue(mockNavigate); // Mock useNavigate to return our function

    render(
        <MemoryRouter>
            <LandingPage />
        </MemoryRouter>
    );

    const input = screen.getByLabelText("Enter Poll Code"); // Selecting the input by the label text

    await userEvent.type(input, "1");

    // Simulate pressing the "Enter" key to trigger the onKeyDown handler
    await userEvent.keyboard("{enter}");

    // Assert that navigate was called with the correct path
    expect(mockNavigate).toHaveBeenCalledWith("/poll/1");
});

test("bell icon click navigates to notifications", async () => {
    const mockNavigate = vi.fn();
    useNavigate.mockReturnValue(mockNavigate);

    const suggestions = ["Suggestion 1", "Suggestion 2"]; // Mocking suggestions data
  
    render(
      <MemoryRouter>
        <UserProvider value={{ suggestions }}> {/* Providing context */}
          <Header />
        </UserProvider>
      </MemoryRouter>
    );
  
    const bellIconDiv = screen.getByTestId("bell-icon");
    await userEvent.click(bellIconDiv);
  
    // Assert that navigate was called with '/notifications'
    expect(mockNavigate).toHaveBeenCalledWith("/notifications");
});
  
test("user profile icon click navigates to user profile", async () => {
    const mockNavigate = vi.fn();
    useNavigate.mockReturnValue(mockNavigate);

    render(
        <MemoryRouter>
        <UserProvider value={{ suggestions: [] }}> {/* Providing context */}
            <Header />
        </UserProvider>
        </MemoryRouter>
    );

    // Click on the user profile icon
    const headerIconDiv = screen.getByTestId("header-icon");
    await userEvent.click(headerIconDiv);
  
    // Assert that navigate was called with '/notifications'
    expect(mockNavigate).toHaveBeenCalledWith("/user");
});