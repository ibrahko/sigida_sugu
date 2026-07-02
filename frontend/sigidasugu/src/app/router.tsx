import { createBrowserRouter } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { HomePage } from '../pages/HomePage'
import { ProductsPage } from '../pages/ProductsPage'
import { ProductDetailPage } from '../pages/ProductDetailPage'
import { CartPage } from '../pages/CartPage'
import { CheckoutPage } from '../pages/CheckoutPage'
import { LoginPage } from '../pages/LoginPage'
import { RegisterPage } from '../pages/RegisterPage'
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage'
import { ResetPasswordPage } from '../pages/ResetPasswordPage'
import { OrdersPage } from '../pages/OrdersPage'
import { OrderDetailPage } from '../pages/OrderDetailPage'
import { AccountPage } from '../pages/AccountPage'
import { AccountShell } from '../components/layout/AccountShell'
import { AccountDashboardPage } from '../pages/AccountDashboardPage'
import { AccountAddressesPage } from '../pages/AccountAddressesPage'
import AdminLayout from '../layouts/AdminLayout'
import AdminGuard from '../components/admin/AdminGuard'
import AdminDashboard from '../pages/admin/AdminDashboard'
import AdminProductsPage from '../pages/admin/AdminProductsPage'
import AdminCategoriesPage from '../pages/admin/AdminCategoriesPage'
import AdminOrdersPage from '../pages/admin/AdminOrdersPage'
import AdminUsersPage from '../pages/admin/AdminUsersPage'
import AdminInviteUserPage from '../pages/admin/AdminInviteUserPage'

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
      { path: 'mot-de-passe-oublie', element: <ForgotPasswordPage /> },
      { path: 'reinitialiser-mot-de-passe/:uid/:token', element: <ResetPasswordPage /> },
      { path: 'commandes', element: <OrdersPage /> },
      { path: 'commandes/:id', element: <OrderDetailPage /> },
      {
        path: 'compte',
        element: <AccountShell />,
        children: [
          { index: true, element: <AccountDashboardPage /> },
          { path: 'profil', element: <AccountPage /> },
          { path: 'adresses', element: <AccountAddressesPage /> },
          { path: 'commandes', element: <OrdersPage /> },
          { path: 'commandes/:id', element: <OrderDetailPage /> },
        ],
      },
    ],
  },
  {
    path: '/admin',
    element: (
      <AdminGuard>
        <AdminLayout />
      </AdminGuard>
    ),
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'products', element: <AdminProductsPage /> },
      { path: 'categories', element: <AdminCategoriesPage /> },
      { path: 'orders', element: <AdminOrdersPage /> },
      { path: 'users', element: <AdminUsersPage /> },
      { path: 'users/invite', element: <AdminInviteUserPage /> },
    ],
  },
])
