import fetch from 'isomorphic-fetch'
import { useEffect, useState } from 'react'

type IApiCallResult<T> = {
  error: string | null
  ready: boolean
  result?: T
}

type UseApiResult<T, R> = Omit<IApiCallResult<T>, 'result'> & {
  result?: R
}

const useAPICall = <R>(url: string): IApiCallResult<R> => {
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<R | undefined>(undefined)

  useEffect(() => {
    let cancelled = false

    const fetchData = async (): Promise<void> => {
      try {
        const res = await fetch(url)

        if (!cancelled) {
          if (res.status !== 200) {
            setError('Bad response status')
          } else {
            setResult(await res.json())
          }
        }
      } catch {
        if (!cancelled) setError('Error loading request')
      } finally {
        if (!cancelled) setReady(true)
      }
    }

    if (url) fetchData()

    return (): void => {
      cancelled = true
    }
  }, [url])

  if (!url) {
    return { error: null, ready: false, result: undefined }
  }

  return { error, ready, result }
}

export interface IGithubIssue {
  title: string
  url: string
  comments: number
  date: string
}

export interface IGithubIssuesResponse {
  issues: Array<IGithubIssue>
}

export function useIssues(): UseApiResult<
  IGithubIssuesResponse,
  IGithubIssue[]
> {
  const response = useAPICall<IGithubIssuesResponse>('/api/github/issues')

  return { ...response, result: response.result?.issues }
}

export interface IDiscussTopic {
  title: string
  comments: number
  date: string
  url: string
}

export interface IDiscussTopicsResponse {
  topics: Array<IDiscussTopic>
}

export function useTopics(): UseApiResult<
  IDiscussTopicsResponse,
  IDiscussTopic[]
> {
  const response = useAPICall<IDiscussTopicsResponse>('/api/discourse')

  return { ...response, result: response.result?.topics }
}

export interface IDiscussCommentsCountResponse {
  count: number
}

export function useCommentsCount(
  commentsUrl: string
): UseApiResult<IDiscussCommentsCountResponse, number> {
  const response = useAPICall<IDiscussCommentsCountResponse>(
    commentsUrl ? `/api/comments?url=${commentsUrl}` : ``
  )

  return { ...response, result: response.result?.count }
}
