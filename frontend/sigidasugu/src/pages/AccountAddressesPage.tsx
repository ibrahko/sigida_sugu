import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, MapPin, Trash2, Edit3 } from 'lucide-react'
import { api } from '../services/api'
import { AccountPageHeader } from '../components/account/AccountLayout'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { Select } from '../components/ui/select'
import { Skeleton } from '../components/ui/skeleton'
import { EmptyState } from '../components/ui/empty-state'
import { Alert } from '../components/ui/alert'

export type Address = {
  id: number
  label: string
  full_name: string
  phone: string
  line1: string
  line2?: string
  city: string
  region: string
  country: string
  landmark?: string
  is_default: boolean
}

type PaginatedResponse<T> = {
    count: number
    next: string | null
    previous: string | null
    results: T[]
  }

  async function fetchAddresses() {
    const { data } = await api.get<Address[] | PaginatedResponse<Address>>(
      '/accounts/addresses/'
    )
  
    if (Array.isArray(data)) {
      return data
    }
  
    return data.results ?? []
  }

type AddressFormState = Omit<Address, 'id' | 'is_default'> & {
  is_default?: boolean
}

const emptyForm: AddressFormState = {
  label: '',
  full_name: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  region: '',
  country: 'Mali',
  landmark: '',
  is_default: false,
}

export function AccountAddressesPage() {
  const queryClient = useQueryClient()

  const { data: addresses, isLoading } = useQuery({
    queryKey: ['account-addresses'],
    queryFn: fetchAddresses,
  })

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<AddressFormState>(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [globalError, setGlobalError] = useState<string | null>(null)

  const resetForm = () => {
    setForm(emptyForm)
    setErrors({})
    setGlobalError(null)
    setEditingId(null)
  }

  const openCreateForm = () => {
    resetForm()
    setShowForm(true)
  }

  const openEditForm = (address: Address) => {
    setForm({
      label: address.label,
      full_name: address.full_name,
      phone: address.phone,
      line1: address.line1,
      line2: address.line2 || '',
      city: address.city,
      region: address.region,
      country: address.country,
      landmark: address.landmark || '',
      is_default: address.is_default,
    })
    setEditingId(address.id)
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    resetForm()
  }

  const validate = () => {
    const nextErrors: Record<string, string> = {}

    if (!form.label.trim()) nextErrors.label = "Donne un nom à l'adresse (ex: Maison, Bureau)."
    if (!form.full_name.trim()) nextErrors.full_name = 'Le nom complet est requis.'
    if (!form.phone.trim()) nextErrors.phone = 'Le numéro de téléphone est requis.'
    if (!form.line1.trim()) nextErrors.line1 = "L'adresse principale est requise."
    if (!form.city.trim()) nextErrors.city = 'La ville est requise.'
    if (!form.region.trim()) nextErrors.region = 'La région est requise.'
    if (!form.country.trim()) nextErrors.country = 'Le pays est requis.'

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const createMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        ...form,
        is_default: !!form.is_default,
      }
      const { data } = await api.post<Address>('/accounts/addresses/', payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account-addresses'] })
      closeForm()
    },
    onError: () => {
      setGlobalError('Impossible d’enregistrer cette adresse. Réessaie dans un instant.')
    },
  })

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!editingId) return null
      const payload = {
        ...form,
        is_default: !!form.is_default,
      }
      const { data } = await api.put<Address>(
        `/accounts/addresses/${editingId}/`,
        payload,
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account-addresses'] })
      closeForm()
    },
    onError: () => {
      setGlobalError('Impossible de mettre à jour cette adresse.')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/accounts/addresses/${id}/`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account-addresses'] })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setGlobalError(null)
    if (!validate()) return
    if (editingId) {
      updateMutation.mutate()
    } else {
      createMutation.mutate()
    }
  }

  return (
    <div className="space-y-6">
      <AccountPageHeader
        title="Mes adresses"
        eyebrow="Livraison"
        subtitle="Enregistre tes adresses pour accélérer le checkout."
        actions={
          <Button onClick={openCreateForm} size="sm" variant="brand">
            <Plus className="h-4 w-4" />
            Ajouter
          </Button>
        }
      />

      {/* Liste des adresses */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-28 rounded-[28px]" />
          <Skeleton className="h-28 rounded-[28px]" />
        </div>
      ) : !addresses || addresses.length === 0 ? (
        <EmptyState
          title="Aucune adresse enregistrée"
          description="Ajoute une adresse pour la réutiliser à chaque commande."
          action={
            <Button onClick={openCreateForm}>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter une première adresse
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((address) => (
            <div
              key={address.id}
              className="flex flex-col justify-between rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-soft)]"
            >
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--color-brand-soft)] text-[var(--color-brand)]">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <p className="font-semibold text-[var(--color-text)]">{address.label}</p>
                  {address.is_default && (
                    <span className="rounded-full bg-[var(--color-brand-soft)] px-2.5 py-0.5 text-[10px] font-semibold uppercase text-[var(--color-brand)]">
                      Par défaut
                    </span>
                  )}
                </div>
                <div className="space-y-1 text-sm text-[var(--color-text-secondary)]">
                  <p className="font-medium text-[var(--color-text)]">{address.full_name}</p>
                  <p>{address.phone}</p>
                  <p>{address.line1}</p>
                  {address.line2 ? <p>{address.line2}</p> : null}
                  <p>
                    {address.city}, {address.region}, {address.country}
                  </p>
                  {address.landmark ? (
                    <p className="text-xs text-[var(--color-muted)]">Repère : {address.landmark}</p>
                  ) : null}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 border-t border-[var(--color-border)] pt-4">
                <Button size="sm" variant="secondary" onClick={() => openEditForm(address)}>
                  <Edit3 className="h-4 w-4" />
                  Modifier
                </Button>
                {!address.is_default && (
                  <>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openEditForm({ ...address, is_default: true })}
                    >
                      Par défaut
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                      onClick={() => deleteMutation.mutate(address.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Formulaire d'ajout / édition */}
      {showForm && (
        <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-soft)]">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-[var(--color-text)]">
              {editingId ? 'Modifier une adresse' : 'Ajouter une adresse'}
            </h2>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              Ces informations seront proposées lors du checkout.
            </p>
          </div>
          <div>
            {globalError && (
              <div className="mb-4">
                <Alert variant="error">{globalError}</Alert>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="grid gap-4 md:grid-cols-2"
            >
              <Input
                name="label"
                label="Nom de l’adresse"
                placeholder="Maison, Bureau..."
                value={form.label}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, label: e.target.value }))
                }
                error={errors.label}
              />

              <Input
                name="full_name"
                label="Nom complet"
                placeholder="Nom et prénom du destinataire"
                value={form.full_name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, full_name: e.target.value }))
                }
                error={errors.full_name}
              />

              <Input
                name="phone"
                label="Téléphone"
                placeholder="+22370000000"
                value={form.phone}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, phone: e.target.value }))
                }
                error={errors.phone}
              />

              <Input
                name="line1"
                label="Adresse (ligne 1)"
                placeholder="Rue, porte, immeuble..."
                value={form.line1}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, line1: e.target.value }))
                }
                error={errors.line1}
              />

              <Input
                name="line2"
                label="Complément d’adresse"
                placeholder="Appartement, étage, etc. (optionnel)"
                value={form.line2}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, line2: e.target.value }))
                }
              />

              <Input
                name="city"
                label="Ville"
                placeholder="Bamako"
                value={form.city}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, city: e.target.value }))
                }
                error={errors.city}
              />

              <Input
                name="region"
                label="Région"
                placeholder="District de Bamako"
                value={form.region}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, region: e.target.value }))
                }
                error={errors.region}
              />

              <Select
                name="country"
                label="Pays"
                value={form.country}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, country: e.target.value }))
                }
                error={errors.country}
              >
                <option value="Mali">Mali</option>
                <option value="Guinée">Guinée</option>
                <option value="Sénégal">Sénégal</option>
              </Select>

              <div className="md:col-span-2">
                <Textarea
                  name="landmark"
                  label="Repère"
                  placeholder="Ex: proche de la station, mosquée, école…"
                  value={form.landmark}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, landmark: e.target.value }))
                  }
                  rows={3}
                />
              </div>

              <div className="md:col-span-2 flex items-center gap-2">
                <input
                  id="is_default"
                  type="checkbox"
                  className="h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-brand)] focus:ring-[var(--color-brand)]"
                  checked={!!form.is_default}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      is_default: e.target.checked,
                    }))
                  }
                />
                <label htmlFor="is_default" className="text-sm text-[var(--color-text-secondary)]">
                  Utiliser comme adresse par défaut
                </label>
              </div>

              <div className="md:col-span-2 flex flex-wrap items-center gap-3 pt-2">
                <Button
                  type="submit"
                  variant="brand"
                  isLoading={createMutation.isPending || updateMutation.isPending}
                >
                  {editingId ? 'Mettre à jour' : 'Enregistrer'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={closeForm}
                >
                  Annuler
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}