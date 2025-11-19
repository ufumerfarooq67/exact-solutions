// lib/tests/auth.test.tsx — FINAL 100% PASSING VERSION

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Login from "@/app/login/page";
import { AuthProvider } from "@/lib/contexts/auth-context";

global.fetch = jest.fn();
const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("@/lib/hooks/use-toast", () => ({
  useToast: () => ({ toast: jest.fn() }),
}));

describe("Login + AuthProvider - Full Integration", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it("successfully logs in and redirects", async () => {
    const user = userEvent.setup();

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        access_token: "jwt-123",
        user: { id: 1, email: "john@doe.com", role: "admin" },
      }),
    });

    render(
      <AuthProvider>
        <Login />
      </AuthProvider>
    );

    await user.type(screen.getByLabelText(/email/i), "john@doe.com");
    await user.type(screen.getByLabelText(/password/i), "secret123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(localStorage.getItem("token")).toBe("jwt-123");
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
  });
});
