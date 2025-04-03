import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import PollDetails from "../pages/PollDetails";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { UserProvider } from "../contexts/UserContext";
import { vi, beforeEach, test, expect } from "vitest"; // Import expect from vitest

// Mock poll data
const mockPollDataBeforeVote = {
    pollId: 1,
    userId: 123,
    title: "Favorite Color?",
    description: "Vote for your favorite color!",
    dateCreated: "2025-01-01T12:00:00Z",
    dateEnded: "2025-12-31T12:00:00Z",
    pollType: 0,
    isActive: true,
    choices: [
        { choiceId: 1, name: "Red", numVotes: 5, userIds: [] },
        { choiceId: 2, name: "Blue", numVotes: 3, userIds: [] },
    ],
};

// Mock useNavigate
vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return {
        ...actual,
        useNavigate: () => vi.fn(),
    };
});

// Mock API responses
beforeEach(() => {
    vi.restoreAllMocks();

    vi.spyOn(global, "fetch").mockImplementation((url, options) => {
        if (url.includes("/api/poll/1") && (!options || options.method === "GET")) {
            return Promise.resolve({
                json: () => Promise.resolve(mockPollDataBeforeVote),
            });
        }
        if (url.includes("/api/poll/vote") && options?.method === "PATCH") {
            return Promise.resolve({
                json: () => Promise.resolve({ message: "Vote submitted successfully!" }),
            });
        }
        // Mock unexpected API calls (e.g., SignalR and tracking)
        if (url.includes("/voteHub/negotiate") || url.includes("/api/track")) {
            return Promise.resolve({
                json: () => Promise.resolve({}), // Empty response
            });
        }

        return Promise.reject(new Error(`Unexpected API call: ${url}`));
    });
});

test("renders poll details correctly", async () => {
    render(
        <UserProvider>
            <MemoryRouter initialEntries={["/poll/1"]}>
                <Routes>
                    <Route path="/poll/:pollId" element={<PollDetails />} />
                </Routes>
            </MemoryRouter>
        </UserProvider>
    );

    expect(screen.getByText(/Loading poll.../i)).toBeInTheDocument();

    await waitFor(() => {
        expect(screen.getByText("Favorite Color?")).toBeInTheDocument();
        expect(screen.getByText("Vote for your favorite color!")).toBeInTheDocument();
    });
});

test("sends a vote and updates the poll details page", async () => {
    render(
        <UserProvider>
            <MemoryRouter initialEntries={["/poll/1"]}>
                <Routes>
                    <Route path="/poll/:pollId" element={<PollDetails />} />
                </Routes>
            </MemoryRouter>
        </UserProvider>
    );

    await waitFor(() => screen.getByText("Favorite Color?"));

    // Click on "Red" to vote
    const redButton = screen.getByText("Red");
    fireEvent.click(redButton);

    await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining("/api/poll/vote"),
            expect.objectContaining({
                method: "PATCH",
            })
        );
    });

    //expect(screen.getByText("Vote submitted successfully!")).toBeInTheDocument();
});




