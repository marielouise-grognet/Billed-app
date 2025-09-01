import { ROUTES_PATH } from '../constants/routes.js'
import { formatDate, formatStatus } from "../app/format.js"
import Logout from "./Logout.js"

export default class {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    const buttonNewBill = document.querySelector(`button[data-testid="btn-new-bill"]`)
    if (buttonNewBill) buttonNewBill.addEventListener('click', this.handleClickNewBill)
    const iconEye = document.querySelectorAll(`div[data-testid="icon-eye"]`)
    if (iconEye) iconEye.forEach(icon => {
      icon.addEventListener('click', () => this.handleClickIconEye(icon))
    })
    new Logout({ document, localStorage, onNavigate })
  }

  handleClickNewBill = () => {
    this.onNavigate(ROUTES_PATH['NewBill'])
  }

  handleClickIconEye = (icon) => {
    const billUrl = icon.getAttribute("data-bill-url")
    const imgWidth = Math.floor($('#modaleFile').width() * 0.5)
    $('#modaleFile').find(".modal-body").html(`<div style='text-align: center;' class="bill-proof-container"><img width=${imgWidth} src=${billUrl} alt="Bill" /></div>`)
    $('#modaleFile').modal('show')
  }

  getBills = () => { // ICI, on répare le BUG 1 (marche pour l'affichage mais pas pour le test - test ne reçoit pas les données triées de getBills mais les données non triées du mock
  if (this.store) {
    return this.store
      .bills()
      .list()
      .then(snapshot => {
        const bills = snapshot
          .map(doc => ({
            ...doc,
            rawDate: new Date(doc.date),  // Ajoute rawDate pour trier correctement
            status: formatStatus(doc.status)
          }))
          // TRI DU PLUS RÉCENT AU PLUS ANCIEN pour passer le test
          .sort((a, b) => b.rawDate - a.rawDate) 

          .map(doc => {
            try {
              return {
                ...doc,
                date: formatDate(doc.date) // Formate la date pour l'affichage
              }
            } catch (e) {
              console.log(e, 'for', doc)
              return doc
            }
          })
        return bills
      })
  }
}

}