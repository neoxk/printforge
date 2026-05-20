import { useEffect, type RefObject } from 'react'

const RESIZE_MESSAGE_TYPE = 'printforge:options:resize'

export function useIframeResize(pageRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (window.parent === window) return

    let animationFrame = 0
    const sendHeight = () => {
      window.cancelAnimationFrame(animationFrame)
      animationFrame = window.requestAnimationFrame(() => {
        const height = Math.ceil(
          Math.max(
            pageRef.current?.scrollHeight ?? 0,
            document.body.scrollHeight,
            document.documentElement.scrollHeight,
          ),
        )

        window.parent.postMessage({ type: RESIZE_MESSAGE_TYPE, height }, '*')
      })
    }

    const observer = new ResizeObserver(sendHeight)
    observer.observe(document.body)
    if (pageRef.current) observer.observe(pageRef.current)

    sendHeight()
    window.addEventListener('load', sendHeight)

    return () => {
      window.cancelAnimationFrame(animationFrame)
      window.removeEventListener('load', sendHeight)
      observer.disconnect()
    }
  }, [pageRef])
}
