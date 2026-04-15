'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

async function getClientAndEntreprise() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  const { data: entreprise } = await supabase
    .from('entreprises').select('id').eq('user_id', user.id).single()
  if (!entreprise) redirect('/dashboard/onboarding')
  return { supabase, entrepriseId: entreprise.id }
}

export interface Contact {
  id: string
  prenom: string
  nom: string
  email: string
  role: 'dirigeant' | 'chef_equipe' | 'rrh' | 'responsable_hse' | 'autre'
  rappels_actifs: boolean
}

export async function getContacts(): Promise<Contact[]> {
  const { supabase, entrepriseId } = await getClientAndEntreprise()
  const { data } = await supabase
    .from('contacts_entreprise')
    .select('id, prenom, nom, email, role, rappels_actifs')
    .eq('entreprise_id', entrepriseId)
    .order('nom')
  return (data ?? []) as Contact[]
}

export async function createContact(payload: {
  prenom: string
  nom: string
  email: string
  role: Contact['role']
}): Promise<Contact> {
  const { supabase, entrepriseId } = await getClientAndEntreprise()
  const { data, error } = await supabase
    .from('contacts_entreprise')
    .insert({ ...payload, entreprise_id: entrepriseId })
    .select('id, prenom, nom, email, role, rappels_actifs')
    .single()
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/parametres/contacts')
  revalidatePath('/dashboard/plan-action')
  return data as Contact
}

export async function updateContact(
  contactId: string,
  payload: Partial<Omit<Contact, 'id'>>
): Promise<void> {
  const { supabase } = await getClientAndEntreprise()
  const { error } = await supabase
    .from('contacts_entreprise')
    .update(payload)
    .eq('id', contactId)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/parametres/contacts')
  revalidatePath('/dashboard/plan-action')
}

export async function deleteContact(contactId: string): Promise<void> {
  const { supabase } = await getClientAndEntreprise()
  const { error } = await supabase
    .from('contacts_entreprise')
    .delete()
    .eq('id', contactId)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/parametres/contacts')
  revalidatePath('/dashboard/plan-action')
}

export async function toggleRappelsContact(
  contactId: string,
  actif: boolean
): Promise<void> {
  const { supabase } = await getClientAndEntreprise()
  const { error } = await supabase
    .from('contacts_entreprise')
    .update({ rappels_actifs: actif })
    .eq('id', contactId)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/parametres/contacts')
}
