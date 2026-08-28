import { useCallback, useEffect, useState } from 'react'
import { getApiErrorMessage } from '@/services/api'
import { createMember, deleteMember, getMember, listMembers, updateMember, updateMemberStatus, type MemberQuery } from '@/services/memberService'
import type { Member, MemberInput, MemberStatus } from '@/types/app'

const emptyQuery: MemberQuery = {}

export function useMembers(initialQuery: MemberQuery = emptyQuery) {
  const [members, setMembers] = useState<Member[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async (query: MemberQuery = initialQuery) => {
    setIsLoading(true); setError('')
    try { const result = await listMembers(query); setMembers(result.members) }
    catch (reason) { setError(getApiErrorMessage(reason, 'Unable to load members.')) }
    finally { setIsLoading(false) }
  }, [initialQuery])

  useEffect(() => {
    let active = true
    void listMembers(initialQuery)
      .then((result) => { if (active) setMembers(result.members) })
      .catch((reason) => { if (active) setError(getApiErrorMessage(reason, 'Unable to load members.')) })
      .finally(() => { if (active) setIsLoading(false) })
    return () => { active = false }
  }, [initialQuery])

  const save = async (input: MemberInput, id?: string) => {
    const member = id ? await updateMember(id, input) : await createMember(input)
    setMembers((items) => id ? items.map((item) => item.id === id ? member : item) : [member, ...items])
    return member
  }
  const find = (id: string) => getMember(id)
  const remove = async (id: string) => { await deleteMember(id); setMembers((items) => items.filter((item) => item.id !== id)) }
  const changeStatus = async (id: string, status: MemberStatus) => { const member = await updateMemberStatus(id, status); setMembers((items) => items.map((item) => item.id === id ? member : item)) }

  return { members, isLoading, error, setError, reload: load, save, find, remove, changeStatus }
}
