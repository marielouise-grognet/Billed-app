/**
 * @jest-environment jsdom
 */

import Bills from "../containers/Bills.js"
import { formatStatus } from "../app/format.js"

describe("Bills container", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <button data-testid="btn-new-bill"></button>
      <div data-testid="icon-eye" data-bill-url="url1"></div>
      <div data-testid="icon-eye" data-bill-url="url2"></div>
      <div id="modaleFile">
        <div class="modal-body"></div>
      </div>
    `
  })

  test("getBills returns undefined if store is null", async () => {
    const billsContainer = new Bills({ document, onNavigate: jest.fn(), store: null })
    const result = await billsContainer.getBills()
    expect(result).toBeUndefined()
  })

  test("getBills returns bills sorted by descending date", async () => {
    const store = {
      bills: () => ({
        list: () => Promise.resolve([
          { date: "2023-01-01", status: "pending" },
          { date: "2023-03-01", status: "accepted" },
          { date: "2023-02-01", status: "refused" }
        ])
      })
    }

    const billsContainer = new Bills({ document, onNavigate: jest.fn(), store })
    const bills = await billsContainer.getBills()

    // ✅ Utiliser rawDate pour comparaison
    const dates = bills.map(b => b.rawDate.getTime())
    expect(dates[0]).toBeGreaterThan(dates[1])
    expect(dates[1]).toBeGreaterThan(dates[2])
  })

  test("getBills handles invalid date format", async () => {
    const store = {
      bills: () => ({
        list: () => Promise.resolve([{ date: "invalid-date", status: "pending" }])
      })
    }

    const billsContainer = new Bills({ document, onNavigate: jest.fn(), store })
    const bills = await billsContainer.getBills()
    expect(bills[0].status).toBe(formatStatus("pending"))
    expect(bills[0].date).toBe("invalid-date")
  })

  test("handleClickNewBill triggers onNavigate", () => {
    const onNavigate = jest.fn()
    const billsContainer = new Bills({ document, onNavigate, store: {} })
    const button = document.querySelector('[data-testid="btn-new-bill"]')
    button.click()
    expect(onNavigate).toHaveBeenCalled()
  })

  test("handleClickIconEye opens modal", () => {
    const billsContainer = new Bills({ document, onNavigate: jest.fn(), store: {} })
    const icon = document.querySelector('[data-testid="icon-eye"]')
    billsContainer.handleClickIconEye(icon)
    const modalContent = document.querySelector('#modaleFile .modal-body').innerHTML
    expect(modalContent).toContain('img')
  })
})
