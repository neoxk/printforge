import { useEffect, type RefObject } from 'react'
import { getParentTargetOrigin } from './parentMessaging.js'

const RESIZE_MESSAGE_TYPE = 'printforge:options:resize'

export function useIframeResize(pageRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (globalThis.parent === globalThis.window) return

    const targetOrigin = getParentTargetOrigin()
    if (!targetOrigin) return

    let animationFrame = 0
    const sendHeight = () => {
      globalThis.cancelAnimationFrame(animationFrame)
      animationFrame = globalThis.requestAnimationFrame(() => {
        const height = Math.ceil(
          Math.max(
            pageRef.current?.scrollHeight ?? 0,
            document.body.scrollHeight,
            document.documentElement.scrollHeight,
          ),
        )

        globalThis.parent.postMessage({ type: RESIZE_MESSAGE_TYPE, height }, targetOrigin)
      })
    }

    const observer = new ResizeObserver(sendHeight)
    observer.observe(document.body)
    if (pageRef.current) observer.observe(pageRef.current)

    sendHeight()
    globalThis.addEventListener('load', sendHeight)

    return () => {
      globalThis.cancelAnimationFrame(animationFrame)
      globalThis.removeEventListener('load', sendHeight)
      observer.disconnect()
    }
  }, [pageRef])
}
