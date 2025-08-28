/**
 * @jest-environment jsdom
 */

import { screen } from "@testing-library/dom"
import ErrorPage from "../views/ErrorPage.js"

describe('Given I am connected on app (as an Employee or an HR admin)', () => {
  describe('When ErrorPage is called without and error in its signature', () => {
    test(('Then, it should render ErrorPage with no error message'), () => {
      const html = ErrorPage()
      document.body.innerHTML = html
      expect(screen.getAllByText('Erreur')).toBeTruthy()
      expect(screen.getByTestId('error-message').innerHTML.trim().length).toBe(0)
    })
  })
  describe('When ErrorPage is called with error message in its signature', () => {
    test(('Then, it should render ErrorPage with its error message'), () => {
      const error = 'Erreur de connexion internet'
      const html = ErrorPage(error)
      document.body.innerHTML = html
      expect(screen.getAllByText(error)).toBeTruthy()
    })
  })

  describe('When ErrorPage is called with HTTP errors', () => {
  test('Then, it should render ErrorPage with 404 error message', () => { // Ecriture d'un test pour erreur 404
    const error404 = '404 Not Found'
    const html = ErrorPage(error404)
    document.body.innerHTML = html
    expect(screen.getAllByText('Erreur')).toBeTruthy()
    expect(screen.getByTestId('error-message').textContent.trim()).toBe(error404)
  })

  test('Then, it should render ErrorPage with 500 error message', () => { // Ecriture d'un test pour erreur 500
    const error500 = '500 Internal Server Error'
    const html = ErrorPage(error500)
    document.body.innerHTML = html
    expect(screen.getAllByText('Erreur')).toBeTruthy()
    expect(screen.getByTestId('error-message').textContent.trim()).toBe(error500)
  })
})

})