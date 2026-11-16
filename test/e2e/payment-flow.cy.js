const demoPassword = 'BrewLite123!'

function loginAsCustomer({ withNotification = false } = {}) {
  cy.request('POST', '/api/auth/login', {
    loginId: 'demo-customer',
    password: demoPassword,
  }).then(({ body }) => {
    cy.visit('/', {
      onBeforeLoad(window) {
        window.localStorage.clear()
        window.sessionStorage.clear()
        window.localStorage.setItem('brewlite.storage-reset.v1', 'done')
        window.localStorage.setItem('brewlite.session', JSON.stringify({
          token: body.token,
          role: 'CUSTOMER',
          name: body.user.fullName,
          email: body.user.email,
          id: body.user.id,
          username: body.user.username,
          createdAt: Date.now(),
        }))
        if (withNotification) {
          window.localStorage.setItem('brewlite.customer-notifications', JSON.stringify([{
            id: 'existing-payment',
            title: 'Thanh toán thành công',
            body: 'Đã thanh toán thành công đơn hàng #ORD_TEST',
            createdAt: Date.now(),
            isRead: false,
            orderCode: 'ORD_TEST',
          }]))
        }
      },
    })
    cy.wait('@products')
  })
}

function placeOrderAndOpenQr() {
  cy.get('button[aria-label^="Thêm "][aria-label$=" vào giỏ hàng"]')
    .should('have.length.greaterThan', 0)
    .first()
    .click()

  cy.get('input[name="size"][value="L"]').check({ force: true })
  cy.get('input[type="checkbox"]').first().check({ force: true })
  cy.contains('button', 'Thêm vào giỏ').click()
  cy.contains('button', 'Mở giỏ hàng').click()
  cy.contains('button', 'Tiến hành thanh toán').click()
  cy.get('#checkout-name').clear().type('Demo Customer')
  cy.get('#checkout-phone').clear().type('0901234567')
  cy.contains('button', /^Xác nhận đặt hàng/).click()
  cy.contains('button', /^Xác nhận$/).click()
  cy.wait('@createOrder').its('response.statusCode').should('equal', 200)
  cy.get('input[name="payment-method"][value="VIETQR"]').check({ force: true })
  cy.wait('@createPayment')
}

describe('BrewLite demo accounts', () => {
  it('authenticates all seeded demo accounts', () => {
    const accounts = [
      ['demo-manager', 'ROLE_MANAGER'],
      ['demo-staff', 'STAFF'],
      ['demo-customer', 'ROLE_CUSTOMER'],
    ]

    accounts.forEach(([loginId, role]) => {
      cy.request('POST', '/api/auth/login', {
        loginId,
        password: demoPassword,
      }).then(({ status, body }) => {
        expect(status).to.equal(200)
        expect(body.user.username).to.equal(loginId)
        expect(body.user.role).to.equal(role)
        expect(body.token).to.be.a('string').and.not.be.empty
      })
    })
  })
})

describe('BrewLite payment flow', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/products').as('products')
    cy.intercept('POST', '/api/orders').as('createOrder')
    cy.intercept('POST', '/api/payments/create').as('createPayment')
    loginAsCustomer()
  })

  it('confirms a VietQR payment and marks the order PAID', () => {
    cy.intercept('POST', '/api/payments/confirm').as('confirmPayment')
    cy.intercept({ method: 'GET', url: /\/api\/orders\/[^/?]+$/ }).as('orderDetails')

    placeOrderAndOpenQr()
    cy.contains('button', 'Giả lập Thanh toán Thành công').click()

    cy.wait('@confirmPayment')
      .its('response.body.status')
      .should('equal', 'SUCCESS')
    cy.wait('@orderDetails')
      .its('response.body.status')
      .should('equal', 'PAID')
  })

  it('cancels the order when payment simulation fails', () => {
    cy.intercept('PATCH', '/api/orders/*/status').as('cancelOrder')

    placeOrderAndOpenQr()
    cy.contains('button', 'Giả lập Lỗi / Hủy thanh toán').click()

    cy.wait('@cancelOrder')
      .its('response.body.status')
      .should('equal', 'CANCELLED')
    cy.contains('Giao dịch không thành công hoặc đã bị hủy').should('be.visible')
  })
})

describe('BrewLite logout', () => {
  it('hides notifications and clears cart after logout', () => {
    cy.intercept('GET', '/api/products').as('products')
    loginAsCustomer({ withNotification: true })

    cy.get('button[aria-label^="Thêm "][aria-label$=" vào giỏ hàng"]')
      .should('have.length.greaterThan', 0)
      .first()
      .click()
    cy.get('input[name="size"][value="L"]').check({ force: true })
    cy.get('input[type="checkbox"]').first().check({ force: true })
    cy.contains('button', 'Thêm vào giỏ').click()
    cy.contains('button', 'Mở giỏ hàng').find('span.absolute').should('contain', '1')

    cy.contains('button', 'Khách hàng Demo').click()
    cy.contains('button', 'Đăng xuất').click()
    cy.contains('button', 'Xác nhận đăng xuất').click()
    cy.location('pathname').should('equal', '/login')

    cy.visit('/')
    cy.wait('@products')
    cy.contains('button', 'Thông báo').click()
    cy.contains('Vui lòng đăng nhập để xem thông báo.').should('be.visible')
    cy.contains('Thanh toán thành công').should('not.exist')

    cy.contains('button', 'Mở giỏ hàng').click()
    cy.contains('Giỏ hàng đang trống').should('be.visible')
    cy.contains('món đã chọn').should('not.exist')
    cy.contains('button', 'Mở giỏ hàng').find('span.absolute').should('not.exist')
  })
})
