import { servePlanMeta } from '../_shared/ogMeta.js'

export async function onRequestGet(context) {
  const id = context.params.id
  return servePlanMeta(context, { fetchPath: `/gallery/${id}`, ogId: id })
}
