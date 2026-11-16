const demoAccounts = [
  { loginId: 'user@brewlite.vn', role: 'CUSTOMER', path: '/' },
  { loginId: 'staff@brewlite.vn', role: 'STAFF', path: '/staff/orders' },
  { loginId: 'manager@brewlite.vn', role: 'MANAGER', path: '/admin/dashboard' },
]

describe('demo account sign-in', () => {
  for (const account of demoAccounts) {
    it(`signs in the ${account.role.toLowerCase()} account`, () => {
      cy.intercept('POST', '/api/auth/login').as('login')
      cy.visit('/login')
      cy.get('#login-identifier').type(account.loginId)
      cy.get('#login-password').type('BrewLite123!')
      cy.get('button[type="submit"]').contains('Đăng nhập').click()

      cy.wait('@login').its('response.statusCode').should('eq', 200)
      cy.location('pathname').should('eq', account.path)
      cy.window().then((window) => {
        const session = JSON.parse(window.localStorage.getItem('brewlite.session'))
        expect(session.role).to.eq(account.role)
      })
    })
  }
})
