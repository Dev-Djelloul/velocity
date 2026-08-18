import { servePlanMeta } from './_shared/ogMeta.js'

export default async (request, context) => {
  const id = new URL(request.url).pathname.split('/').filter(Boolean).pop()
  return servePlanMeta(request, context, { fetchPath: `/shares/${id}`, ogId: id })
}
