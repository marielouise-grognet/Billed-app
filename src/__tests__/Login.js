/**
 * @jest-environment jsdom
 */

import LoginUI from "../views/LoginUI";
import Login from "../containers/Login.js";
import { ROUTES } from "../constants/routes";
import { fireEvent, screen } from "@testing-library/dom";

describe("Login container", () => {
  let onNavigate;
  let store;

  beforeEach(() => {
    document.body.innerHTML = LoginUI();
    onNavigate = jest.fn();
    store = {
      login: jest.fn().mockResolvedValue({ jwt: "token123" }),
      users: jest.fn().mockReturnValue({
        create: jest.fn().mockResolvedValue({}),
      }),
    };

    // Mock localStorage
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
      },
      writable: true,
    });
  });

  describe("Employee login", () => {
    test("should render login page if fields are empty", () => {
      const form = screen.getByTestId("form-employee");
      const handleSubmit = jest.fn((e) => e.preventDefault());
      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(screen.getByTestId("form-employee")).toBeTruthy();
    });

    test("should update inputs if filled incorrectly", () => {
      fireEvent.change(screen.getByTestId("employee-email-input"), { target: { value: "pasunemail" } });
      fireEvent.change(screen.getByTestId("employee-password-input"), { target: { value: "azerty" } });

      expect(screen.getByTestId("employee-email-input").value).toBe("pasunemail");
      expect(screen.getByTestId("employee-password-input").value).toBe("azerty");
    });

    test("should login successfully with correct data", async () => {
      const loginInstance = new Login({ document, localStorage: window.localStorage, onNavigate, PREVIOUS_LOCATION: "", store });

      fireEvent.change(screen.getByTestId("employee-email-input"), { target: { value: "employee@test.com" } });
      fireEvent.change(screen.getByTestId("employee-password-input"), { target: { value: "password" } });

      await fireEvent.submit(screen.getByTestId("form-employee"));

      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        "user",
        JSON.stringify({
          type: "Employee",
          email: "employee@test.com",
          password: "password",
          status: "connected",
        })
      );
      expect(onNavigate).toHaveBeenCalledWith(ROUTES["Bills"]);
    });

    test("should call createUser if login fails", async () => {
      const loginInstance = new Login({ document, localStorage: window.localStorage, onNavigate, PREVIOUS_LOCATION: "", store });
      loginInstance.login = jest.fn().mockRejectedValue(new Error("fail login"));
      loginInstance.createUser = jest.fn().mockResolvedValue({});

      fireEvent.change(screen.getByTestId("employee-email-input"), { target: { value: "fail@test.com" } });
      fireEvent.change(screen.getByTestId("employee-password-input"), { target: { value: "fail" } });

      await fireEvent.submit(screen.getByTestId("form-employee"));

      expect(loginInstance.createUser).toHaveBeenCalled();
    });
  });

  describe("Admin login", () => {
    test("should render login page if fields are empty", () => {
      const form = screen.getByTestId("form-admin");
      const handleSubmit = jest.fn((e) => e.preventDefault());
      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(screen.getByTestId("form-admin")).toBeTruthy();
    });

    test("should update inputs if filled incorrectly", () => {
      fireEvent.change(screen.getByTestId("admin-email-input"), { target: { value: "pasunemail" } });
      fireEvent.change(screen.getByTestId("admin-password-input"), { target: { value: "azerty" } });

      expect(screen.getByTestId("admin-email-input").value).toBe("pasunemail");
      expect(screen.getByTestId("admin-password-input").value).toBe("azerty");
    });

    test("should login successfully with correct data", async () => {
      const loginInstance = new Login({ document, localStorage: window.localStorage, onNavigate, PREVIOUS_LOCATION: "", store });

      fireEvent.change(screen.getByTestId("admin-email-input"), { target: { value: "admin@test.com" } });
      fireEvent.change(screen.getByTestId("admin-password-input"), { target: { value: "password" } });

      await fireEvent.submit(screen.getByTestId("form-admin"));

      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        "user",
        JSON.stringify({
          type: "Admin",
          email: "admin@test.com",
          password: "password",
          status: "connected",
        })
      );
      expect(onNavigate).toHaveBeenCalledWith(ROUTES["Dashboard"]);
    });

    test("should call createUser if login fails", async () => {
      const loginInstance = new Login({ document, localStorage: window.localStorage, onNavigate, PREVIOUS_LOCATION: "", store });
      loginInstance.login = jest.fn().mockRejectedValue(new Error("fail login"));
      loginInstance.createUser = jest.fn().mockResolvedValue({});

      fireEvent.change(screen.getByTestId("admin-email-input"), { target: { value: "fail@test.com" } });
      fireEvent.change(screen.getByTestId("admin-password-input"), { target: { value: "fail" } });

      await fireEvent.submit(screen.getByTestId("form-admin"));

      expect(loginInstance.createUser).toHaveBeenCalled();
    });
  });

  describe("Edge cases", () => {
    test("login() and createUser() return null if store is null", () => {
      const loginInstance = new Login({ document, localStorage: window.localStorage, onNavigate, PREVIOUS_LOCATION: "", store: null });

      expect(loginInstance.login({ email: "x", password: "x" })).toBeNull();
      expect(loginInstance.createUser({ type: "Employee", email: "x", password: "x" })).toBeNull();
    });
  });
});
