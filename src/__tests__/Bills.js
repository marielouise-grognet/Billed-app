/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import Bills from "../containers/Bills.js";
import router from "../app/Router.js";
import { formatStatus, formatDate } from "../app/format.js"

// Mock des données renvoyées par le store
const billsMock = [
  { id: '1', date: '2023-06-15', status: 'pending', amount: 100, type: 'Transport', name: 'Taxi' },
  { id: '2', date: '2023-07-01', status: 'accepted', amount: 200, type: 'Hotel', name: 'Hotel' },
];

describe("Bills container", () => {
  describe("getBills", () => {
    test("should fetch bills from store, sort by date descending and format them", async () => {
      const storeMock = {
        bills: () => ({
          list: jest.fn().mockResolvedValue(billsMock)
        })
      }

      const billsContainer = new Bills({ document, onNavigate: jest.fn(), store: storeMock, localStorage: window.localStorage })

      const result = await billsContainer.getBills()

      // Vérifie qu'il y a bien autant de bills que dans le mock
      expect(result).toHaveLength(billsMock.length)

      // Vérifie que les dates sont triées du plus récent au plus ancien
      expect(result[0].rawDate >= result[1].rawDate).toBe(true)

      // Vérifie que les dates ont été formatées
      expect(result[0].date).toBe(formatDate(billsMock[1].date)) // bill le plus récent
      expect(result[1].date).toBe(formatDate(billsMock[0].date))

      // Vérifie que le statut a été formaté
      expect(result[0].status).toBe(formatStatus(billsMock[1].status))
      expect(result[1].status).toBe(formatStatus(billsMock[0].status))
    })
  })
})


describe("Given I am connected as an employee", () => {
  beforeEach(() => {
    Object.defineProperty(window, "localStorage", { value: localStorageMock });
    window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));
    document.body.innerHTML = `<div id="root"></div>`;
    router();
  });

  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      expect(windowIcon.classList.contains("active-icon")).toBe(true);
    });

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });

    test("Clicking on NewBill button should navigate to NewBill page", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const onNavigate = (pathname) => {
        document.body.innerHTML = `<div>NewBill Page</div>`;
      };
      const billsContainer = new Bills({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      });
      const newBillBtn = screen.getByTestId("btn-new-bill");
      userEvent.click(newBillBtn);
      expect(document.body.innerHTML).toContain("NewBill Page");
    });

    test("handleClickNewBill should call onNavigate with NewBill route", () => {
      const onNavigateMock = jest.fn();
      const billsContainer = new Bills({ document, onNavigate: onNavigateMock, store: null, localStorage: localStorageMock });
      billsContainer.handleClickNewBill();
      expect(onNavigateMock).toHaveBeenCalledWith(ROUTES_PATH.NewBill);
    });

    test("Clicking on NewBill button navigates to NewBill page", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const onNavigateMock = jest.fn();
      const billsContainer = new Bills({ document, onNavigate: onNavigateMock, store: null, localStorage: localStorageMock });
      document.querySelector('[data-testid="btn-new-bill"]').click();
      expect(onNavigateMock).toHaveBeenCalledWith(ROUTES_PATH.NewBill);
    });

    test("Clicking on eye icon should open modal with image", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      // Assure la modale existe dans le DOM
      const modalDiv = document.createElement("div");
      modalDiv.setAttribute("id", "modaleFile");
      modalDiv.innerHTML = `<div class="modal-body"></div>`;
      document.body.appendChild(modalDiv);

      $.fn.modal = jest.fn();

      const billsContainer = new Bills({
        document,
        onNavigate: jest.fn(),
        store: null,
        localStorage: window.localStorage,
      });

      const firstEyeIcon = screen.getAllByTestId("icon-eye")[0];
      userEvent.click(firstEyeIcon);

      const modal = document.getElementById("modaleFile");
      expect(modal.innerHTML).toContain("img");
    });
  });
});
