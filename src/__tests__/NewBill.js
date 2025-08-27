/**
 * @jest-environment jsdom
 */

import { fireEvent, screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES_PATH } from "../constants/routes.js"
import { localStorageMock } from "../__mocks__/localStorage.js"

describe("Given I am connected as an employee", () => {
  beforeEach(() => {
    // Simule un user connecté
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    window.localStorage.setItem('user', JSON.stringify({ type: 'Employee', email: "test@test.com" }))
  })

  describe("When I am on NewBill Page", () => {
    test("Then the NewBill form should render", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      expect(screen.getByTestId("form-new-bill")).toBeTruthy()
    })

    

    test("Then uploading an invalid file (pdf) should trigger an alert and reset input", () => {
      document.body.innerHTML = NewBillUI()
      const onNavigate = jest.fn()
      const mockStore = { bills: jest.fn() }

      window.alert = jest.fn() // Mock alert

      const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage })
      const fileInput = screen.getByTestId("file")

      const file = new File(["doc"], "test.pdf", { type: "application/pdf" })
      fireEvent.change(fileInput, { target: { files: [file] } })

      expect(window.alert).toHaveBeenCalledWith("Seuls les fichiers JPG, JPEG ou PNG sont autorisés !")
      expect(fileInput.value).toBe("") // L'input doit être reset
    })

    test("Then submitting the form with valid data should call updateBill and navigate to Bills", () => {
      document.body.innerHTML = NewBillUI()
      const onNavigate = jest.fn()
      const newBill = new NewBill({ document, onNavigate, store: null, localStorage: window.localStorage })
      newBill.updateBill = jest.fn() // Mock pour éviter vrai appel API

      // Remplit les champs
      screen.getByTestId("expense-type").value = "Transports"
      screen.getByTestId("expense-name").value = "Train Paris-Lyon"
      screen.getByTestId("amount").value = "120"
      screen.getByTestId("datepicker").value = "2023-04-10"
      screen.getByTestId("vat").value = "20"
      screen.getByTestId("pct").value = "10"
      screen.getByTestId("commentary").value = "Voyage pro"

      // Simule un fichier
      newBill.fileUrl = "https://test.com/test.jpg"
      newBill.fileName = "test.jpg"

      const form = screen.getByTestId("form-new-bill")
      fireEvent.submit(form)

      expect(newBill.updateBill).toHaveBeenCalled()
      expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH['Bills'])
    })
  })
})
