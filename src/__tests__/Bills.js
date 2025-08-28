/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom"
import userEvent from "@testing-library/user-event"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH } from "../constants/routes.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import Bills from "../containers/Bills.js"
import router from "../app/Router.js"
import { formatStatus, formatDate } from "../app/format.js"

// Mock des données renvoyées par le store
const billsMock = [
  { id: '1', date: '2023-06-15', status: 'pending', amount: 100, type: 'Transport', name: 'Taxi' },
  { id: '2', date: '2023-07-01', status: 'accepted', amount: 200, type: 'Hotel', name: 'Hotel' },
];

describe("Given I am connected as an employee", () => {
  beforeEach(() => {
    Object.defineProperty(window, "localStorage", { value: localStorageMock })
    window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }))
    document.body.innerHTML = `<div id="root"></div>`
    router()
  })


  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => { // l'icone facture devrait s'éclaircir 
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId("icon-window"))
      const windowIcon = screen.getByTestId("icon-window")
      expect(windowIcon.classList.contains("active-icon")).toBe(true)
    })

    test("Then bills should be ordered from earliest to latest", () => { // les factures devraient se classer de la plus récente à la plus ancienne 
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })


    describe("When I am clicking on NewBill button", () => {
      test("then handleClickNewBill should call onNavigate with NewBill route", () => { // la navigation devrait conduire à une nouvelle note de frais vierge
        const onNavigateMock = jest.fn()
        const billsContainer = new Bills({ document, onNavigate: onNavigateMock, store: null, localStorage: localStorageMock })
        billsContainer.handleClickNewBill()
        expect(onNavigateMock).toHaveBeenCalledWith(ROUTES_PATH.NewBill)
      })
    })

    describe("when I am clicking on eye icon", () => {
      test("It should open modal with image", () => { // la modale avec l'image de la note de frais devrait s'ouvrir
        document.body.innerHTML = BillsUI({ data: bills })
        const modalDiv = document.createElement("div")
        modalDiv.setAttribute("id", "modaleFile")
        modalDiv.innerHTML = `<div class="modal-body"></div>`
        document.body.appendChild(modalDiv)
        $.fn.modal = jest.fn()

        const billsContainer = new Bills({
          document,
          onNavigate: jest.fn(),
          store: null,
          localStorage: window.localStorage,
        })

        const firstEyeIcon = screen.getAllByTestId("icon-eye")[0]
        userEvent.click(firstEyeIcon)
        const modal = document.getElementById("modaleFile")
        expect(modal.innerHTML).toContain("img")
      })
    })









  })
})
