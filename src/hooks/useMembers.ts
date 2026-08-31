import { useCallback, useEffect, useState } from 'react'
import { getApiErrorMessage } from '@/services/api'
import {
  createMember,
  getMember,
  listMembers,
  updateMember,
  updateMemberStatus,
  type MemberQuery,
} from '@/services/memberService'
import type { Member, MemberInput, MemberStatus, MemberUpdateInput } from '@/types/app'

const emptyQuery: MemberQuery = {}

export function useMembers(initialQuery: MemberQuery = emptyQuery) {
  const [members, setMembers] = useState<Member[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(
    async (query: MemberQuery = initialQuery) => {
      setIsLoading(true)
      setError('')
      try {
        const result = await listMembers(query)
        setMembers(result.members)
        setTotal(result.total)
      } catch (reason) {
        setError(getApiErrorMessage(reason, 'Unable to load members.'))
      } finally {
        setIsLoading(false)
      }
    },
    [initialQuery],
  )

  useEffect(() => {
    let active = true
    void listMembers(initialQuery)
      .then((result) => {
        if (active) {
          setMembers(result.members)
          setTotal(result.total)
        }
      })
      .catch((reason) => {
        if (active) setError(getApiErrorMessage(reason, 'Unable to load members.'))
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => {
      active = false
    }
  }, [initialQuery])

  const create = async (input: MemberInput) => {
    const member = await createMember(input)
    setMembers((items) => [member, ...items])
    return member
  }
  const update = async (id: string, input: MemberUpdateInput) => {
    const member = await updateMember(id, input)
    setMembers((items) => items.map((item) => (item.id === id ? member : item)))
    return member
  }
  const find = (id: string) => getMember(id)
  const changeStatus = async (id: string, status: MemberStatus) => {
    const changed = await updateMemberStatus(id, status)
    setMembers((items) =>
      items.map((item) => (item.id === id ? { ...item, status: changed.status } : item)),
    )
  }

  return {
    members,
    total,
    isLoading,
    error,
    setError,
    reload: load,
    create,
    update,
    find,
    changeStatus,
  }
}
