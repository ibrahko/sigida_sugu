import { createBrowserRouter } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { HomePage } from '../pages/HomePage'
import { ProductsPage } from '../pages/ProductsPage'
import { ProductDetailPage } from '../pages/ProductDetailPage'
import { CartPage } from '../pages/CartPage'
import { CheckoutPage } from '../pages/CheckoutPage'
import { LoginPage } from '../pages/LoginPage'
import { RegisterPage } from '../pages/RegisterPage'
import { OrdersPage } from '../pages/OrdersPage'
import { AccountPage } from '../pages/AccountPage'
import { AccountShell } from '../components/layout/AccountShell'
import { AccountDashboardPage } from '../pages/AccountDashboardPage'
import { AccountAddressesPage } from '../pages/AccountAddressesPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'produits', element: <ProductsPage /> },
      { path: 'produits/:id', element: <ProductDetailPage /> },
      { path: 'panier', element: <CartPage /> },
      { path: 'commande', element: <CheckoutPage /> },
      { path: 'connexion', element: <LoginPage /> },
      { path: 'inscription', element: <RegisterPage /> },
      { path: 'commandes', element: <OrdersPage /> },
      {
        path: 'compte',
        element: <AccountShell />,
        children: [
          { index: true, element: <AccountDashboardPage /> },
          { path: 'profil', element: <AccountPage /> },
          { path: 'adresses', element: <AccountAddressesPage /> },
          { path: 'commandes', element: <OrdersPage /> },
        ],
      },
    ],
  },
])
