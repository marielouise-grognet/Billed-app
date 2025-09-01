/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES_PATH } from "../constants/routes.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import mockStore from "../__mocks__/store"

jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {
  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    window.localStorage.setItem('user', JSON.stringify({ type: 'Employee', email: "test@test.com" }))
  })

// TOUS LES TESTS CI-APRÈS ONT ÉTÉ CRÉÉS

  describe("When I am on NewBill Page", () => {
    test("Then the NewBill form should render", () => { // le formulaire de nouvelle note de frais devrait s'afficher
      const html = NewBillUI()
      document.body.innerHTML = html
      expect(screen.getByTestId("form-new-bill")).toBeTruthy()
    })

    test("Then uploading an invalid file (pdf) should trigger an alert and reset input", () => { // le téléchargement d'un fichier avec extension non valide devrait déclencher une alerte et réinitialiser la saisie
      document.body.innerHTML = NewBillUI()
      const onNavigate = jest.fn()
      const mockStore = { bills: jest.fn() }
      window.alert = jest.fn()
      const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage })
      const fileInput = screen.getByTestId("file")
      const file = new File(["doc"], "test.pdf", { type: "application/pdf" })
      fireEvent.change(fileInput, { target: { files: [file] } })
      expect(window.alert).toHaveBeenCalledWith("Seuls les fichiers JPG, JPEG ou PNG sont autorisés !")
      expect(fileInput.value).toBe("")
    })


    test("Then submitting a valid NewBill should call store.bills().update and navigate to Bills", async () => { // on vérifie l’appel réel au store mocké (update) et la navigation
      document.body.innerHTML = NewBillUI()
      const onNavigate = jest.fn()
      const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage })
      const updateSpy = jest.spyOn(mockStore.bills(), "update")       // On espionne la méthode update pour pouvoir faire toHaveBeenCalled() dessus ensuite
      // On remplit les champs
      screen.getByTestId("expense-type").value = "Transports"
      screen.getByTestId("expense-name").value = "Train Paris-Lyon"
      screen.getByTestId("amount").value = "120"
      screen.getByTestId("datepicker").value = "2023-04-10"
      screen.getByTestId("vat").value = "20"
      screen.getByTestId("pct").value = "10"
      screen.getByTestId("commentary").value = "Voyage pro"

      newBill.fileUrl = "https://test.com/test.jpg"
      newBill.fileName = "test.jpg"

      const form = screen.getByTestId("form-new-bill")
      fireEvent.submit(form) // on soumet pour  déclencher updateBill qui appelle le store mocké 

      await waitFor(() => expect(updateSpy).toHaveBeenCalled())
      expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH["Bills"])       // on vérifie que update a bien été appelée
    })

  })
})
