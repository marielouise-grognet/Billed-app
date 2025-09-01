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
import '@testing-library/jest-dom'


const billsMock = {
  bills: () => ({
    list: jest.fn(() =>
      Promise.resolve([
        { id: '1', date: '2023-07-01', status: 'accepted', amount: 200, type: 'Hotel', name: 'Hotel' },
        { id: '2', date: '2023-06-15', status: 'pending', amount: 100, type: 'Transport', name: 'Taxi' },
      ])
    ),
  }),
}

describe("Given I am connected as an employee", () => {
  beforeEach(() => { // nécessaire pour faire fonctionner test d'intégration 
    Object.defineProperty(window, "localStorage", { value: localStorageMock })
    window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }))
    document.body.innerHTML = `<div id="root"></div>`
    router()
  })

  // TEST CRÉÉ pour tester getBill 
  test("Then the bills are displayed in the UI", async () => {
    const billsContainer = new Bills({ document, onNavigate: jest.fn(), store: billsMock, localStorage: window.localStorage })
    const bills = await billsContainer.getBills() //   Récupère les factures
    document.body.innerHTML = BillsUI({ data: bills })     // Injecte l'UI dans DOM
    const rows = screen.getByTestId("tbody").querySelectorAll("tr")
    expect(rows.length).toBe(bills.length)     // Vérifie que chaque facture apparaît dans une ligne
  })

  // Test déjà existant
  test("Then bill icon in vertical layout should be highlighted", async () => { // l'icone facture devrait s'éclaircir 
    window.onNavigate(ROUTES_PATH.Bills)
    await waitFor(() => screen.getByTestId("icon-window"))
    const windowIcon = screen.getByTestId("icon-window")
    expect(windowIcon.classList.contains("active-icon")).toBe(true) // ajout de expect pour vérifier effectivité de la class active-icone
  })
  // test déjà existant
  test("Then bills should be ordered from earliest to latest", () => { // test affichage du plus récent au plus ancien
    document.body.innerHTML = BillsUI({ data: bills })
    const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
    const antiChrono = (a, b) => ((a < b) ? 1 : -1)
    const datesSorted = [...dates].sort(antiChrono)
    expect(dates).toEqual(datesSorted)
  })

  // TEST CRÉÉ
  describe("When I am clicking on NewBill button", () => {
    test("then handleClickNewBill should call onNavigate with NewBill route", () => { // la navigation devrait conduire à une nouvelle note de frais vierge
      const onNavigateMock = jest.fn() // on génère une fonction de navigation factice
      const billsContainer = new Bills({ document, onNavigate: onNavigateMock, store: null, localStorage: localStorageMock })
      billsContainer.handleClickNewBill() // on appelle la fonction à tester 
      expect(onNavigateMock).toHaveBeenCalledWith(ROUTES_PATH.NewBill) // on vérifie que onNavigateMock a été appelé avec le bon artgument
    })
  })


  // TEST CRÉÉ
  describe("when I am clicking on eye icon", () => {
    test("It should open modal with image", () => { // la modale avec l'image de la note de frais devrait s'ouvrir
      document.body.innerHTML = BillsUI({ data: bills }) // on injecte UI dans le DOM => permet d'avoir les icones "oeil"
      const modalDiv = document.createElement("div") // on créé la modale
      modalDiv.setAttribute("id", "modaleFile")
      modalDiv.innerHTML = `<div class="modal-body"></div>`
      document.body.appendChild(modalDiv)
      $.fn.modal = jest.fn()

      const billsContainer = new Bills({ document, onNavigate: jest.fn(), store: null, localStorage: window.localStorage, })

      const firstEyeIcon = screen.getAllByTestId("icon-eye")[0] // on récupère l'icône oeil 
      userEvent.click(firstEyeIcon)// on simule le clic 
      const modal = document.getElementById("modaleFile") // on récupère la modale 
      expect(modal.innerHTML).toContain("img") // on vérifie que la modale contient une image 
    })
  })
})











